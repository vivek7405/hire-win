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

  const { logo, companyName, companyInfo, website, theme } = UserObj.parse(data) as any

  // if (!logo) return null

  const slug = slugify(`${data.companyName}`, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.user.findFirst({ where: { slug: e } })
  )

  const user = await db.user.update({
    where,
    data: logo
      ? {
          logo,
          companyName,
          companyInfo,
          website,
          theme,
          slug: initial.companyName !== data.companyName ? newSlug : initial.slug,
        }
      : {
          companyName,
          companyInfo,
          website,
          theme,
          slug: initial.companyName !== data.companyName ? newSlug : initial.slug,
        },
  })

  return user
}
export default Guard.authorize("update", "user", updateUser)
