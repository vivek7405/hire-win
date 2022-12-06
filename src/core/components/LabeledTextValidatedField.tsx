import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface LabeledTextValidatedFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  subLabel?: string
  subLabel2?: string
  type?: "text" | "password" | "email" | "number" | "date" | "url"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  showAsterisk?: boolean
}

const ControllerPlus = ({ control, transform, name, isSubmitting, testid, ...props }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <input
          onChange={(e) => field.onChange(transform.output(e))}
          value={transform.input(field.value)}
          disabled={isSubmitting}
          {...props}
          data-testid={`${testid && `${testid}-`}input`}
          className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
        />
      )}
    />
  )
}

export const LabeledTextValidatedField = forwardRef<
  HTMLInputElement,
  LabeledTextValidatedFieldProps
>(({ label, subLabel, subLabel2, outerProps, name, testid, ...props }, ref) => {
  const {
    control,
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
          data-testid={`${testid && `${testid}-`}label`}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {props.showAsterisk && "*"}
        </label>
      )}
      {subLabel && <label className="block text-xs text-gray-700">{subLabel}</label>}
      {subLabel2 && <label className="block text-xs text-gray-700">{subLabel2}</label>}
      <div className={label && "mt-1"}>
        {/* <input
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="border border-gray-300 px-2 py-2 block w-full sm:text-sm rounded"
          /> */}
        <ControllerPlus
          transform={{
            input: (value) => {
              switch (props.type) {
                case "number":
                  return isNaN(value) || value === 0 ? "" : value.toString()
                case "date":
                  return value && value instanceof Date ? value.toISOString().split("T")[0] : value
                default:
                  return value
              }
            },
            output: (e) => {
              let output
              switch (props.type) {
                case "number":
                  output = parseInt(e.target.value, 10)
                  return isNaN(output) ? 0 : output
                case "date":
                  return new Date(e.target.value)
                default:
                  return e.target.value
              }
            },
          }}
          {...props}
          control={control}
          name={name}
          testid={testid}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
})

export default LabeledTextValidatedField
