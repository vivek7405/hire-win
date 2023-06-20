import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  type?: "text" | "password" | "email" | "number" | "date" | "url" | "hidden"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  onChange?: any
  showAsterisk?: boolean
  subLabel?: string
  subLabel2?: string
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ label, subLabel, subLabel2, outerProps, name, ...props }, ref) => {
    const {
      register,
      setValue,
      formState: { isSubmitting, errors },
    } = useFormContext()

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? (errors[name] as any)?.join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name?.charAt(0)?.toUpperCase() + name?.slice(1)}: ${error}`, {
          id: errors[name]?.message?.toString(),
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
        {subLabel && <label className="block text-xs text-gray-600">{subLabel}</label>}
        {subLabel2 && <label className="block text-xs text-gray-600">{subLabel2}</label>}
        <div className={label && "mt-1"}>
          <input
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={(e) => {
              try {
                setValue(name, e.target.value, { shouldDirty: true })
                props.onChange && props.onChange(e)
              } catch (e) {
                console.log(`Some error occurred while setting input field value for - ${name}`)
              }
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledTextField
