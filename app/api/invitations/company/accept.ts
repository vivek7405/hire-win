import db from "db"
import { hash256, BlitzApiRequest, BlitzApiResponse } from "blitz"
import stripe from "app/core/utils/stripe"
import { CompanyUserRole, UserRole } from "@prisma/client"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: BlitzApiRequest, res: BlitzApiResponse) => {
  // 1. Try to find this token in the database
  const hashedToken = hash256(req.query.token as string)
  const possibleToken = await db.token.findFirst({
    where: { hashedToken, type: "INVITE_TO_COMPANY_TOKEN" },
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
  if (!possibleToken) {
    throw new Error("No token found")
  }
  const savedToken = possibleToken

  // 3. If token has expired, error
  if (savedToken.expiresAt < new Date()) {
    throw new Error("Token has expired")
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
      `${process.env.NEXT_PUBLIC_APP_URL}/signup/${
        (req.query.companyId as string) || "0"
      }?next=/api/invitations/company/accept/&token=${req.query.token}&companyId=${
        req.query.companyId
      }`
    )
  } else {
    // 6. If there is a user, create a new membership associated with the project and user
    await db.companyUser.create({
      data: {
        role: CompanyUserRole.USER,
        company: {
          connect: {
            id: parseInt((req.query.companyId as string) || "0"),
          },
        },
        user: {
          connect: {
            id: existingUser?.id,
          },
        },
      },
    })

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
}
