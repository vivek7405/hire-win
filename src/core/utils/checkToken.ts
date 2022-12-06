import { hash256 } from "@blitzjs/auth";
import db from "db"

export const checkToken = async (req, res, { PUBLIC }) => {
  const PUBLIC_KEY = req.query.PUBLIC_KEY
  const SECRET_KEY = req.query.SECRET_KEY

  const findPublicKey = await db.token.findFirst({
    where: {
      hashedToken: PUBLIC_KEY,
      AND: {
        type: "PUBLIC_KEY",
      },
    },
    include: {
      job: {
        include: {
          users: true,
        },
      },
    },
  })

  const findPrivateKey = await db.token.findFirst({
    where: {
      hashedToken: hash256(SECRET_KEY),
      AND: {
        type: "SECRET_KEY",
      },
    },
    include: {
      job: {
        include: {
          users: true,
        },
      },
    },
  })

  if (PUBLIC === true && !PUBLIC_KEY) {
    return false
  }

  if (PUBLIC === true && !findPublicKey) {
    return false
  }

  if (PUBLIC === false && (!PUBLIC_KEY || !SECRET_KEY)) {
    return false
  }

  if (PUBLIC === false && (!findPublicKey || !findPrivateKey)) {
    return false
  }

  if (PUBLIC === false && findPublicKey?.job?.id !== findPrivateKey?.job?.id) {
    return false
  }

  return { jobId: findPublicKey?.jobId as string }
}
