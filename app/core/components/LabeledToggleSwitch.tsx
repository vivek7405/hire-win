import { forwardRef, PropsWithoutRef, useEffect, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import * as ToggleSwitch from "@radix-ui/react-switch"

export interface LabeledToggleSwitchProps extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  defaultChecked?: boolean
  value?: boolean
  width?: number
  height?: number
  onChange?: any
  flex?: boolean
}

export const LabeledToggleSwitch = forwardRef<HTMLInputElement, LabeledToggleSwitchProps>(
  ({ label, outerProps, name, defaultChecked, width, height, flex, ...props }, ref) => {
    const {
      control,
      formState: { isSubmitting, errors },
      setValue,
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

    useEffect(() => {
      setValue(name, !!props.value)
    }, [setValue, name, props.value])

    return (
      <div {...outerProps} className={flex ? "flex items-center" : ""}>
        {label && (
          <label
            data-testid={`${props.testid && `${props.testid}-`}label`}
            className="block text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            {label}
          </label>
        )}
        <div className={label && (flex ? "ml-1" : "mt-1")}>
          <Controller
            name={name}
            control={control}
            defaultValue={!!defaultChecked}
            render={({ field: { onChange, value } }) => {
              return (
                <ToggleSwitch.Root
                  onCheckedChange={(switchState) => {
                    onChange(switchState)
                    props.onChange && props.onChange(switchState)
                  }}
                  defaultChecked={!!defaultChecked}
                  // defaultValue={defaultValue || ""}
                  aria-label="Text alignment"
                  className={`flex justify-center items-center
                  w-${height ? height * 2 : 10} h-${height ? height + 1 : 6}
                  rounded-full border-theme-600 border-2`}
                >
                  <ToggleSwitch.Thumb
                    className={`inline-block rounded-full
                    w-${height || 5} h-${height || 5}
                    ${value ? `translate-x-2` : `-translate-x-2`}
                    bg-theme-600
                    hover:bg-theme-700 text-white font-medium text-xs
                    leading-tight uppercase focus:outline-none
                    focus:ring-0 transition duration-150 ease-in-out`}
                  />
                </ToggleSwitch.Root>
              )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledToggleSwitch
