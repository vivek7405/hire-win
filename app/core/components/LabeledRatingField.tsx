import { StarIcon as StarIconOutline } from "@heroicons/react/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/solid"
import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import Rating from "react-rating"

export interface LabeledRatingFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  disabled?: boolean
  defaultValue?: any
  onChange?: any
}

export const LabeledRatingField = forwardRef<HTMLInputElement, LabeledRatingFieldProps>(
  ({ label, outerProps, name, defaultValue, disabled, ...props }, ref) => {
    const {
      control,
      // setValue,
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
        {label && (
          <label
            data-testid={`${props.testid && `${props.testid}-`}label`}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className={label && `mt-1`}>
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => {
              return (
                <Rating
                  emptySymbol={<StarIconOutline className="h-6 w-auto" />}
                  fullSymbol={<StarIconSolid className="h-6 w-auto" />}
                  initialRating={value}
                  onChange={(val) => {
                    onChange(val)
                    props.onChange && props.onChange({ name, value: val })
                  }}
                />
              )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledRatingField
