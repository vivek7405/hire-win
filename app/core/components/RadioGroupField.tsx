import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import * as RadioGroup from "@radix-ui/react-radio-group"

export interface RadioGroupFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: any
  isBorder?: boolean
  isCol?: boolean
  onChange?: any
  initialValue?: string
}

export const RadioGroupField = forwardRef<HTMLInputElement, RadioGroupFieldProps>(
  ({ label, outerProps, name, options, isBorder, isCol, initialValue, ...props }, ref) => {
    const {
      register,
      control,
      formState: { isSubmitting, errors },
    } = useFormContext()

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? errors[name]?.join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name?.charAt(0)?.toUpperCase() + name?.slice(1)}: ${error}`, {
          id: errors[name],
        })
    }, [errors, name])

    return (
      <Controller
        render={({ field }) => {
          const { onChange, value } = field

          return (
            <div className={`flex flex-col space-y-2`}>
              {label && (
                <label
                  data-testid={`${props.testid && `${props.testid}-`}label`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
              )}

              <RadioGroup.Root
                value={value || initialValue}
                onValueChange={(e) => {
                  props.onChange && props.onChange(e)
                  onChange(e)
                }}
                className={`flex ${isCol ? "flex-col space-y-2" : ""}`}
              >
                {options?.map((option, i) => {
                  return (
                    <div
                      key={i}
                      className={`w-full p-2 ${
                        isBorder ? "border" : ""
                      } flex flex-row items-center text-theme-600`}
                    >
                      <RadioGroup.Item className="relative w-full" value={option}>
                        <RadioGroup.Indicator
                          className={`
                            absolute
                            border
                            border-gray-300
                            rounded-full
                            p-1
                            top-1
                            after:bg-theme-500 after:block after:w-2 after:h-2 after:rounded-full
                          `}
                        />
                        <span
                          className={`
                            absolute
                            border
                            border-gray-300
                            rounded-full
                            p-1
                            top-1
                            after:block after:w-2 after:h-2 after:rounded-full
                          `}
                        />
                        <span className="pl-6">{option}</span>
                      </RadioGroup.Item>
                    </div>
                  )
                })}
              </RadioGroup.Root>
            </div>
          )
        }}
        control={control}
        name={name}
      />
    )
  }
)

export default RadioGroupField
