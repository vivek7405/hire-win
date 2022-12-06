import { Suspense, useState } from "react"
import { FormStep } from "types"
import Form from "./Form"

type MultiStepFormProps = {
  steps: FormStep[]
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
}
const MultiStepForm = (props: MultiStepFormProps) => {
  const { steps } = props
  const [step, setStep] = useState(1)

  return (
    <Form
      submitText={step === steps.length ? "Submit" : "Next"}
      isSubmitTop={true}
      schema={steps[step - 1]?.validationSchema}
      initialValues={props.initialValues}
      onSubmit={async (values) => {
        if (step < steps.length) setStep(step + 1)
        else return props.onSubmit(values)
      }}
      testid="jobForm"
      header={props.header}
      subHeader={props.subHeader}
    >
      <div className="overflow-auto flex justify-between whitespace-nowrap items-start space-x-4">
        {steps.map((stp, index) => {
          return (
            <>
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => {
                  setStep(index + 1)
                }}
              >
                <span
                  className={`${
                    step === index + 1 ? "text-theme-400" : "text-neutral-400"
                  } font-semibold`}
                >
                  {stp.name}
                </span>
                {step === index + 1 && (
                  <span className="w-4 h-4 border-2 rounded-full border-theme-300 bg-theme-500" />
                )}
              </div>

              {index + 1 < steps.length && <hr className="border-2 w-full mt-3" />}
            </>
          )
        })}
      </div>

      {steps.map((stp, index) => {
        return (
          index + 1 === step && <Suspense fallback="Loading...">{stp.renderComponent}</Suspense>
        )
      })}
    </Form>
  )
}

export default MultiStepForm
