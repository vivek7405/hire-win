// @ts-nocheck
import { Ctx } from "blitz"
import db, { Prisma } from "db"

type Update__ModelName__Input = Pick<Prisma.__ModelName__UpdateArgs, "where" | "data">

async function update__ModelName__({ where, data }: Update__ModelName__Input, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const __modelName__ = await db.__modelName__.update({
    where,
    data,
  })

  return __modelName__
}

export default update__ModelName__
