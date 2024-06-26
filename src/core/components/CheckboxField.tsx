import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"

export interface CheckboxFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label: string
  subLabel?: string
  subLabel2?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  onChange?: any
  showAsterisk?: boolean
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, subLabel, subLabel2, outerProps, name, ...props }, ref) => {
    const {
      register,
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
        <div className="mt-1 flex pt-2">
          {/* <input
            id={name}
            type="checkbox"
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="align-middle text-theme-600 border border-gray-300 px-2 py-2 block sm:text-sm rounded focus:ring-theme-500"
          /> */}
          <Controller
            name={name}
            control={control}
            defaultValue={props.defaultValue || false}
            render={({ field: { onChange, value } }) => {
              return (
                <input
                  id={name}
                  type="checkbox"
                  disabled={props.disabled || isSubmitting}
                  // {...register(`${name}` as const)}
                  {...props}
                  data-testid={`${props.testid && `${props.testid}-`}input`}
                  className="align-middle text-theme-600 border border-gray-300 px-2 py-2 block sm:text-sm rounded focus:ring-theme-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={(e) => {
                    onChange(e)
                    props.onChange && props.onChange(e.currentTarget.checked)
                  }}
                  checked={!!value || false}
                  value={value}
                />
              )
            }}
          />
          <label
            htmlFor={name}
            data-testid={`${props.testid && `${props.testid}-`}label`}
            className="align-middle block text-sm px-2 font-medium text-gray-700"
          >
            {label} {props.showAsterisk && "*"}
          </label>
        </div>
        <div className="mt-1">
          {subLabel && <label className="block text-xs text-gray-600">{subLabel}</label>}
          {subLabel2 && <label className="block text-xs text-gray-600">{subLabel2}</label>}
        </div>
      </div>
    )
  }
)

export default CheckboxField
