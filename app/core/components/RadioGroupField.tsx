import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import * as RadioGroup from "@radix-ui/react-radio-group"

export interface RadioGroupFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: any
}

export const RadioGroupField = forwardRef<HTMLInputElement, RadioGroupFieldProps>(
  ({ label, outerProps, name, options, ...props }, ref) => {
    const {
      register,
      control,
      formState: { isSubmitting, errors },
    } = useFormContext()

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
      <Controller
        render={({ field }) => {
          const { onChange, value } = field

          return (
            <div className="flex flex-col space-y-2">
              <label
                data-testid={`${props.testid && `${props.testid}-`}label`}
                className="block text-sm font-medium text-gray-700"
              >
                {label}
              </label>

              <RadioGroup.Root
                value={value}
                onValueChange={(e) => {
                  onChange(e)
                }}
                className="flex flex-col space-y-2"
              >
                {options.map((option, i) => {
                  return (
                    <div key={i} className="w-full border p-2 rounded flex flex-row items-center">
                      <RadioGroup.Item className="relative w-full" value={option}>
                        <RadioGroup.Indicator
                          className={`
                            absolute
                            border
                            border-gray-300
                            rounded-full
                            p-1
                            top-1
                            after:bg-indigo-500 after:block after:w-2 after:h-2 after:rounded-full
                          `}
                        />
                        <span className="pl-8">{option}</span>
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
