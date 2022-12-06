import { NextApiRequest, NextApiResponse } from "next"
import { hash256 } from "@blitzjs/auth"
import db from "db"
import stripe from "src/core/utils/stripe"
import { CompanyUserRole, UserRole } from "@prisma/client"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  // 1. Try to find this token in the database
  const hashedToken = hash256(req.query.token as string)
  const possibleToken = await db.token.findFirst({
    where: { hashedToken, type: "CONFIRM_EMAIL" },
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

  if (!existingUser) {
    res.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup/token/${req.query.token}?next=/api/signup/&token=${req.query.token}`
    )
  } else {
    await db.token.delete({ where: { id: savedToken.id } })
    res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/jobs`)
  }
}
