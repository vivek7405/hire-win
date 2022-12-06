import { forwardRef, PropsWithoutRef, useEffect, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

export interface LabeledToggleGroupFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: { label: string; value?: string }[]
  defaultValue?: string
  value?: string
  paddingX?: number
  paddingY?: number
  onChange?: any
}

export const LabeledToggleGroupField = forwardRef<HTMLInputElement, LabeledToggleGroupFieldProps>(
  ({ label, outerProps, name, options, defaultValue, paddingX, paddingY, ...props }, ref) => {
    const {
      control,
      formState: { isSubmitting, errors },
      setValue,
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

    useEffect(() => {
      if (props.value) {
        setValue(name, props.value)
      }
    }, [setValue, name, props.value])

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
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue || ""}
            render={({ field: { onChange, value } }) => {
              return (
                <ToggleGroupPrimitive.Root
                  onValueChange={(value) => {
                    // onChange(e)
                    if (value) {
                      props.onChange && props.onChange(value)
                    }
                  }}
                  type="single"
                  defaultValue={defaultValue || ""}
                  aria-label="Text alignment"
                >
                  {options?.map((op, index) => {
                    return (
                      <ToggleGroupPrimitive.Item
                        key={index}
                        value={op.value || ""}
                        aria-label="Center aligned"
                        className={`inline-block px-${paddingX || 4} py-${
                          paddingY || 2
                        } hover:bg-theme-700 text-white font-medium text-xs leading-tight uppercase focus:outline-none focus:ring-0 transition duration-150 ease-in-out
                        ${value === op.value ? `bg-theme-600` : `bg-theme-500`}
                        ${index === 0 ? `rounded-l` : ``}
                        ${index === options.length - 1 ? `rounded-r` : ``}
                        `}
                      >
                        {op.label}
                      </ToggleGroupPrimitive.Item>
                    )
                  })}
                </ToggleGroupPrimitive.Root>
              )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledToggleGroupField
