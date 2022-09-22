import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { ScoreCardQuestion } from "@prisma/client"
import { ScoreCardQuestionObj } from "../validations"

type UpdateScoreCardQuestionInput = Pick<Prisma.ScoreCardQuestionUpdateArgs, "where" | "data"> & {
  initial: ScoreCardQuestion
}

async function updateScoreCardQuestionName(
  { where, data, initial }: UpdateScoreCardQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { name } = ScoreCardQuestionObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })

  const updateScoreCardQuestionName = await db.scoreCardQuestion.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return updateScoreCardQuestionName
}

export default updateScoreCardQuestionName
