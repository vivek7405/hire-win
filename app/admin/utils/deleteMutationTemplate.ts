// @ts-nocheck
import { Ctx } from "blitz"
import db, { Prisma } from "db"

type Delete__ModelName__Input = Pick<Prisma.__ModelName__DeleteArgs, "where">

async function delete__ModelName__({ where }: Delete__ModelName__Input, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const __modelName__ = await db.__modelName__.delete({
    where,
  })

  return __modelName__
}

export default delete__ModelName__
