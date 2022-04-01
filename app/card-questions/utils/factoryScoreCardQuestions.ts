import { CardQuestion } from "@prisma/client"
import { ExtendedScoreCardQuestion } from "types"

const factoryScoreQuestions = [
  {
    order: 1,
    cardQuestion: {
      name: "Overall Score",
      factory: true,
    } as CardQuestion,
  } as ExtendedScoreCardQuestion,
]

export default factoryScoreQuestions
