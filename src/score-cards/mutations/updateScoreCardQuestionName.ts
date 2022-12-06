import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
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

  const { title } = ScoreCardQuestionObj.parse(data)

  const slug = slugify(title, { strict: true, lower: true })

  const updateScoreCardQuestionName = await db.scoreCardQuestion.update({
    where,
    data: {
      title,
      slug,
    },
  })

  return updateScoreCardQuestionName
}

export default updateScoreCardQuestionName
