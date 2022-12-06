import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import PhoneInputWithCountrySelect from "react-phone-number-input"

export interface LabeledPhoneNumberFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  placeholder?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  disabled?: boolean
  defaultValue?: any
  showAsterisk?: boolean
}

export const LabeledPhoneNumberField = forwardRef<HTMLInputElement, LabeledPhoneNumberFieldProps>(
  ({ label, outerProps, name, defaultValue, disabled, ...props }, ref) => {
    const {
      control,
      // setValue,
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
        <div className={label && `mt-1`}>
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => {
              return (
                <PhoneInputWithCountrySelect
                  international={true}
                  placeholder="Enter phone number"
                  defaultCountry="US"
                  disabled={disabled}
                  value={value}
                  onChange={onChange}
                />
              )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledPhoneNumberField
