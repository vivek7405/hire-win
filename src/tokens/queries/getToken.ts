import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db"

interface GetTokenInput extends Pick<Prisma.TokenFindFirstArgs, "where"> {}

const getToken = async ({ where }: GetTokenInput) => {
  const token = await db.token.findFirst({ where })
  return token
}

export default getToken
