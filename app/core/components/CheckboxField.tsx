import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface CheckboxFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, outerProps, name, ...props }, ref) => {
    const {
      register,
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
      <div {...outerProps}>
        <div className="mt-1 flex pt-2">
          <input
            id={name}
            type="checkbox"
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="align-middle border border-gray-300 px-2 py-2 block sm:text-sm rounded"
          />
          <label
            htmlFor={name}
            data-testid={`${props.testid && `${props.testid}-`}label`}
            className="align-middle block text-sm px-2 font-medium text-gray-700"
          >
            {label}
          </label>
        </div>
      </div>
    )
  }
)

export default CheckboxField
