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

  const { name, logo, companyName, companyInfo, website, theme } = UserObj.parse(data) as any

  // if (!logo) return null

  // const slug = slugify(`${data.companyName}`, { strict: true })
  // const newSlug: string = await findFreeSlug(
  //   slug,
  //   async (e) => await db.user.findFirst({ where: { slug: e } })
  // )

  // let updateData = {
  //   companyName,
  //   companyInfo,
  //   website,
  //   theme,
  //   slug: initial.companyName !== data.companyName ? newSlug : initial.slug,
  // }

  // if (logo) {
  //   updateData["logo"] = logo
  // }

  const user = await db.user.update({
    where,
    data: { name }, // updateData,
  })

  return user
}
export default Guard.authorize("update", "user", updateUser)
