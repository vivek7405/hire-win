import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface LabeledInputSelectFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: string[]
}

export const LabeledInputSelectField = forwardRef<HTMLInputElement, LabeledInputSelectFieldProps>(
  ({ label, outerProps, name, options, ...props }, ref) => {
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
        <label
          data-testid={`${props.testid && `${props.testid}-`}label`}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1">
          <input
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            list={`data-list-${name}`}
            className="border border-gray-300 mt-2 px-2 py-2 block w-full sm:text-sm rounded"
            data-testid={`${props.testid && `${props.testid}-`}input`}
          />
          <datalist id={`data-list-${name}`}>
            {options?.map((op, index) => {
              return <option key={index} value={op} />
            })}
          </datalist>
        </div>
      </div>
    )
  }
)

export default LabeledInputSelectField
