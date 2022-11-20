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
  submitHidden?: boolean
  schema?: S
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  initialValues?: UseFormProps<z.infer<S>>["defaultValues"]
  testid?: string
  header?: string
  headerComponent?: any
  subHeader?: string
  noFormatting?: boolean
  isSubmitTop?: boolean
}

interface OnSubmitResult {
  [prop: string]: any
}

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  submitDisabled,
  submitHidden,
  schema,
  initialValues,
  onSubmit,
  header,
  headerComponent,
  subHeader,
  noFormatting,
  isSubmitTop,
  ...props
}: FormProps<S>) {
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
        className={!noFormatting ? `form space-y-5` : ``}
        {...props}
      >
        <div className={!noFormatting ? `bg-white py-6 px-4 sm:p-6` : ``}>
          <div>
            <div className="flex items-center">
              {(header || subHeader) && (
                <div className="w-3/4">
                  {headerComponent || (
                    <h2 className="text-lg font-medium text-gray-900 whitespace-nowrap">
                      {header}
                    </h2>
                  )}
                  <p className="mt-1 text-sm text-gray-500 whitespace-nowrap">{subHeader}</p>
                </div>
              )}
              <div className="w-1/4">
                {isSubmitTop && submitText && (
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={submitDisabled || ctx.formState.isSubmitting}
                      data-testid={`${props.testid && `${props.testid}-`}submitButton`}
                      className={`${submitHidden && "hidden"} ${
                        submitDisabled && "disabled:opacity-50 cursor-not-allowed"
                      } text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700`}
                    >
                      {submitText}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={!noFormatting ? `mt-6 space-y-5` : ``}>
              {/* Form fields supplied as children are rendered here */}
              {children}
            </div>
            {!isSubmitTop && submitText && (
              <div className="mt-4 text-right">
                <button
                  type="submit"
                  disabled={submitDisabled || ctx.formState.isSubmitting}
                  data-testid={`${props.testid && `${props.testid}-`}submitButton`}
                  className={`${submitHidden && "hidden"} ${
                    submitDisabled && "disabled:opacity-50 cursor-not-allowed"
                  } text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700`}
                >
                  {submitText}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default Form
