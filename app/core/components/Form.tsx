import { ReactNode, PropsWithoutRef } from "react"
import { FormProvider, useForm, UseFormProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText?: string
  submitDisabled?: boolean
  schema?: S
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  testid?: string
  header?: string
  subHeader?: string
}

interface OnSubmitResult {
  [prop: string]: any
}

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  submitDisabled,
  schema,
  initialValues,
  onSubmit,
  header,
  subHeader,
  ...props
}: FormProps<S>) {
  debugger
  const ctx = useForm<z.infer<S>>({
    mode: "onSubmit",
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialValues,
  })

  return (
    <FormProvider {...ctx}>
      <form
        data-testid={`${props.testid && `${props.testid}-`}form`}
        onSubmit={ctx.handleSubmit(async (values) => {
          const result = (await onSubmit(values)) || {}

          for (const [key, value] of Object.entries(result)) {
            ctx.setError(key as any, {
              type: "submit",
              message: value,
            })
          }
        })}
        className="form space-y-5"
        {...props}
      >
        <div className="bg-white py-6 px-4 sm:p-6">
          <div>
            {(header || subHeader) && (
              <div>
                <h2 className="text-lg font-medium text-gray-900">{header}</h2>
                <p className="mt-1 text-sm text-gray-500">{subHeader}</p>
              </div>
            )}
            <div className="mt-6 space-y-5">
              {/* Form fields supplied as children are rendered here */}
              {children}
            </div>
            <div className="mt-4 text-right">
              {submitText && (
                <button
                  type="submit"
                  disabled={submitDisabled || ctx.formState.isSubmitting}
                  data-testid={`${props.testid && `${props.testid}-`}submitButton`}
                  className={`${
                    submitDisabled && "disabled:opacity-50 cursor-not-allowed"
                  } text-white bg-indigo-600 px-4 py-2 rounded-sm hover:bg-indigo-700`}
                >
                  {submitText}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default Form
