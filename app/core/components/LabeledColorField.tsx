import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface LabeledColorFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  defaultValue?: string
}

export const LabeledColorField = forwardRef<HTMLInputElement, LabeledColorFieldProps>(
  ({ label, outerProps, name, defaultValue, ...props }, ref) => {
    const {
      register,
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
      <div {...outerProps}>
        {label && (
          <label
            data-testid={`${props.testid && `${props.testid}-`}label`}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className={label && "mt-1"}>
          <input
            type="color"
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="cursor-pointer disabled:cursor-not-allowed border border-gray-300 block w-full sm:text-sm rounded"
          />
        </div>
      </div>
    )
  }
)

export default LabeledColorField
