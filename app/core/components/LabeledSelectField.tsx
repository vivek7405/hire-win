import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

export interface LabeledSelectFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: { label: string; value?: string }[]
  disabled?: boolean
  onChange?: any
  showAsterisk?: boolean
}

export const LabeledSelectField = forwardRef<HTMLSelectElement, LabeledSelectFieldProps>(
  ({ label, outerProps, name, options, defaultValue, disabled, ...props }, ref) => {
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
            {label} {props.showAsterisk && "*"}
          </label>
        )}
        <div className={label && "mt-1"}>
          <select
            disabled={disabled || isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            className={`${
              disabled && "disabled:opacity-50 cursor-not-allowed"
            } border border-gray-300 mt-2 px-2 py-2 block w-full sm:text-sm rounded`}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            onChange={props.onChange}
          >
            {options?.map((op, index) => {
              return (
                <option key={index} value={op.value}>
                  {op.label}
                </option>
              )
            })}
          </select>
        </div>
      </div>
    )
  }
)

export default LabeledSelectField
