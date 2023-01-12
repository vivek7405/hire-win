import { api } from "src/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import { hash256 } from "@blitzjs/auth"
import db from "db"
import stripe from "src/core/utils/stripe"
import { CompanyUserRole, ParentCompanyUserRole, TokenType, UserRole } from "@prisma/client"

// eslint-disable-next-line import/no-anonymous-default-export
export default api(
  api(async (req, res) => {
    // 1. Try to find this token in the database
    const hashedToken = hash256(req.query.token as string)
    const savedToken = await db.token.findFirst({
      where: { hashedToken, type: TokenType.INVITE_TO_COMPANY },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    // 2. If token not found, error
    if (!savedToken) {
      // throw new Error("No token found")
      res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signup/token/${req.query.token}`)
    }
    if (!savedToken) throw new Error("No Token Found")

    // 3. If token has expired, error
    if (savedToken.expiresAt < new Date()) {
      // throw new Error("Token has expired")
      res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/signup/token/${req.query.token}`)
    }

    // 4. Find if there is an existing user with the email
    const existingUser = await db.user.findFirst({
      where: {
        email: savedToken.sentTo as string,
      },
    })

    // 5. If no existing user, redirect to signup page, that will auto send to this accept route when signup is complete
    if (!existingUser) {
      /* Special Note:
      Since we're using "next" as the first parameter it's prefixed with "?".
      Usually the "token" parameter would come first, but here we need to use "&"
    */
      res.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup/token/${req.query.token}?next=/api/invitations/company/accept/&token=${req.query.token}`
      )
    } else {
      // 6. If there is a user and companyUser does not exist, create a new membership associated with the company and user
      const companyUser = await db.companyUser.findFirst({
        where: { companyId: savedToken.companyId || "0", userId: existingUser.id },
      })
      if (!companyUser) {
        await db.companyUser.create({
          data: {
            role: savedToken.companyUserRole || CompanyUserRole.USER,
            companyId: savedToken.companyId || "0",
            userId: existingUser.id || "0",
          },
        })
      }

      if (savedToken.parentCompanyId) {
        const parentCompanyUserExists = await db.parentCompanyUser.findFirst({
          where: {
            parentCompanyId: savedToken.parentCompanyId || "0",
            userId: existingUser.id || "0",
          },
        })
        if (!parentCompanyUserExists) {
          await db.parentCompanyUser.create({
            data: {
              role: savedToken.parentCompanyUserRole || ParentCompanyUserRole.USER,
              parentCompanyId: savedToken.parentCompanyId || "0",
              userId: existingUser.id || "0",
            },
          })
        }
      }

      // 7. Delete token from database when done
      await db.token.delete({ where: { id: savedToken.id } })

      // 8. Fetch company and it's memberships to count it's length to update stripe subscription quantity (NOTE: this is optional, remove if your business model isn't effected by amount of users per project)
      // const company = await db.company.findFirst({
      //   where: {
      //     id: parseInt((req.query.companyId as string) || "0"),
      //   },
      //   include: {
      //     users: true,
      //   },
      // })

      // 9. Fetch the company subscription and update based on the company membership length
      // if (company?.stripeSubscriptionId) {
      //   const subscription = await stripe.subscriptions.retrieve(company?.stripeSubscriptionId as string)
      //   await stripe.subscriptions.update(company?.stripeSubscriptionId as string, {
      //     proration_behavior: "none",
      //     items: [
      //       {
      //         id: subscription.items.data[0]?.id,
      //         quantity: company?.memberships.length,
      //       },
      //     ],
      //   })
      // }

      res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/jobs`)
    }
  })
)
