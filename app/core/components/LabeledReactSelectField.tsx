import { forwardRef, PropsWithoutRef, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import Select from "react-select"

export interface LabeledReactSelectFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["select"]> {
  name: string
  label?: string
  placeholder?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  options: { label: string; value?: string }[]
  disabled?: boolean
  defaultValue?: any
  isMulti?: boolean
}

export const LabeledReactSelectField = forwardRef<HTMLSelectElement, LabeledReactSelectFieldProps>(
  ({ label, outerProps, name, options, defaultValue, disabled, ...props }, ref) => {
    const {
      control,
      setValue,
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
        <div className={label && "mt-1"}>
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            render={({ field: { onChange, value } }) => {
              return (
                <Select
                  closeMenuOnSelect={!props.isMulti}
                  isDisabled={disabled || isSubmitting}
                  placeholder={props.placeholder}
                  data-testid={`${props.testid && `${props.testid}-`}input`}
                  onChange={(selection: any) => {
                    Array.isArray(selection)
                      ? setValue(
                          name,
                          selection.map((s) => {
                            return s.value
                          })
                        )
                      : setValue(name, selection.value)

                    props.onChange &&
                      props.onChange(
                        Array.isArray(selection)
                          ? selection.map((s) => {
                              return s.value
                            })
                          : selection.value
                      )
                  }}
                  options={options}
                  value={
                    Array.isArray(value)
                      ? options.filter((option) => value.includes(option.value))
                      : options.find((option) => option.value === value)
                  }
                  // defaultValue={Array.isArray(defaultValue) ?
                  //   options.filter(option => defaultValue.includes(option.value)) :
                  //   options.find(option => option.value === defaultValue)}
                  isMulti={props.isMulti}
                  styles={{
                    input: (base) => ({
                      ...base,
                      "input:focus": {
                        boxShadow: "none",
                      },
                    }),
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

export default LabeledReactSelectField
