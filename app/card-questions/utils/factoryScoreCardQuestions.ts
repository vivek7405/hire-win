import { CardQuestion, ScoreCardQuestionBehaviour } from "@prisma/client"
import { ExtendedScoreCardQuestion } from "types"

const factoryScoreQuestions = [
  {
    order: 1,
    behaviour: ScoreCardQuestionBehaviour.REQUIRED,
    allowBehaviourEdit: false,
    cardQuestion: {
      name: "Overall Score",
      factory: true,
    } as CardQuestion,
  } as ExtendedScoreCardQuestion,
]

export default factoryScoreQuestions
