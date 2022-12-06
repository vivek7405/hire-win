import { resolver } from "@blitzjs/rpc";
import db, { Prisma } from "db"

interface GetTokenInput extends Pick<Prisma.TokenFindManyArgs, "where"> {}

const getPendingCompanyInviteTokens = async ({ where }: GetTokenInput) => {
  const token = await db.token.findMany({ where })
  return token
}

export default getPendingCompanyInviteTokens
