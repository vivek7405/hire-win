import { ArrowSmDownIcon } from "@heroicons/react/outline"
import { ScoreCard, ScoreCardJobWorkflowStage, Workflow } from "@prisma/client"
import { forwardRef, PropsWithoutRef, useMemo, useState } from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import Select from "react-select"
import { ExtendedScoreCard, ExtendedWorkflow } from "types"
import LabeledReactSelectField from "./LabeledReactSelectField"

export interface ScoreCardsProps extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  name: string
  selectedWorkflowId: string
  scoreCardMappings?: ScoreCardJobWorkflowStage[]
  workflows: ExtendedWorkflow[]
  scoreCards: ExtendedScoreCard[]
  defaultScoreCard: ExtendedScoreCard
}

export const ScoreCards = forwardRef<HTMLSelectElement, ScoreCardsProps>(
  (
    {
      name,
      selectedWorkflowId,
      scoreCardMappings,
      workflows,
      scoreCards,
      defaultScoreCard,
      ...props
    },
    ref
  ) => {
    const {
      control,
      setValue,
      register,
      formState: { isSubmitting, errors },
    } = useFormContext()
    const { fields, append, remove } = useFieldArray({ name: "scoreCards", control })

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? errors[name].join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${error}`, {
          id: errors[name],
        })
    }, [errors, name])

    return (
      <div>
        {workflows
          .find((w) => w.id === selectedWorkflowId)
          ?.stages?.sort((a, b) => {
            return a.order - b.order
          })
          .map((ws, index) => {
            const existingScoreCardMapping = scoreCardMappings?.find(
              (sc) => sc.workflowStageId === ws.id
            )
            const existingScoreCard: ScoreCard | null | undefined = scoreCards.find(
              (sc) => sc.id === existingScoreCardMapping?.scoreCardId
            )

            return (
              <div key={ws.id}>
                <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
                  <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                    {ws.stage?.name}
                  </div>
                </div>

                <div className="w-32 my-2 flex flex-col items-center justify-center">
                  <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />
                </div>

                <div className="w-32 flex flex-col items-center justify-center">
                  {/* <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center"> */}
                  {/* {ws.stage?.name} */}
                  <LabeledReactSelectField
                    {...register(`scoreCards.${index}.name`)}
                    placeholder={`Score Card for ${ws.stage?.name}`}
                    testid={`scoreCard-${ws.id}`}
                    // disabled={props.workflow && !workflows.find((w) => w.id === props.workflow?.id)}
                    options={
                      !existingScoreCardMapping || existingScoreCard
                        ? [
                            // { label: "Default", value: "" },
                            ...scoreCards.map((sc) => {
                              return { label: sc.name!, value: sc.id! }
                            }),
                          ]
                        : [
                            {
                              label: (existingScoreCard as ScoreCard | null | undefined)?.name!,
                              value: (existingScoreCard as ScoreCard | null | undefined)?.id!,
                            },
                          ]
                    }
                    defaultValue={existingScoreCardMapping?.scoreCardId || defaultScoreCard?.id}
                  />
                  {/* </div> */}
                </div>
              </div>
            )
          })}
      </div>
    )
  }
)

export default ScoreCards
