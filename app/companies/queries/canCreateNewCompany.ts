import Guard from "app/guard/ability"
import { Ctx } from "blitz"

export default async function canCreateNewCompany(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  // const { can: canCreate } = await Guard.can("create", "company", { ...ctx }, {})

  return true
}
