import { Ctx } from "blitz"
import db, { Company, Prisma, User } from "db"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"

type UpdateCompanyInput = Pick<Prisma.CompanyUpdateArgs, "where" | "data"> & {
  initial: Company
}

async function updateCompany({ where, data, initial }: UpdateCompanyInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, logo, website, theme, info } = CompanyObj.parse(data) as any

  const slug = slugify(`${name}`, { strict: true, lower: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.company.findFirst({ where: { slug: e } })
  )

  let updateData = {
    name,
    info,
    website,
    theme,
    slug: initial.name !== name ? newSlug : initial.slug,
  }

  if (logo) {
    updateData["logo"] = logo
  }

  const company = await db.company.update({
    where,
    data: updateData,
  })

  return company
}

export default Guard.authorize("update", "company", updateCompany)
