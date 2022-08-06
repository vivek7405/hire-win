import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface LabeledTextAreaFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  name: string
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
}

export const LabeledTextAreaField = forwardRef<HTMLTextAreaElement, LabeledTextAreaFieldProps>(
  ({ label, outerProps, name, ...props }, ref) => {
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
          <textarea
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="border border-gray-300 mt-2 px-2 py-2 block w-full sm:text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    )
  }
)

export default LabeledTextAreaField
