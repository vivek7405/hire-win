import { Ctx } from "blitz"
import db, { Prisma, User } from "db"
import { UserObj } from "app/users/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateUserInput = Pick<Prisma.UserUpdateArgs, "where" | "data"> & {
  initial: User
}

async function updateUser({ where, data, initial }: UpdateUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { avatar, company } = UserObj.parse(data) as any

  // if (!avatar) return null

  const slug = slugify(`${data.company}`, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.user.findFirst({ where: { slug: e } })
  )

  const user = await db.user.update({
    where,
    data: avatar
      ? {
          avatar,
          company,
          slug: initial.company !== data.company ? newSlug : initial.slug,
        }
      : {
          company,
          slug: initial.company !== data.company ? newSlug : initial.slug,
        },
  })

  return user
}
export default Guard.authorize("update", "user", updateUser)
