import { PlusIcon, XCircleIcon } from "@heroicons/react/outline"
import { forwardRef, PropsWithoutRef, useEffect, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import generateUUID from "../utils/generateUUID"
import LabeledTextField from "./LabeledTextField"

export interface DynamicTextFieldsProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  type?: "text" | "password" | "email" | "number"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
}

export const DynamicTextFields = forwardRef<HTMLInputElement, DynamicTextFieldsProps>(
  ({ label, outerProps, name, ...props }, ref) => {
    const {
      control,
      setValue,
      getValues,
      formState: { isSubmitting, errors },
    } = useFormContext()

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? errors[name][0]?.text?.message || errors[name]
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${error}`, {
          id: errors[name],
        })
    }, [errors, name])

    const [formValue, setformValue] = useState(getValues(name) || [{ id: "", text: "" }])

    function handleAdd() {
      const value = [...formValue]
      value.push({ id: "", text: "" })
      updateFormValue(value)
    }

    function updateFormValue(value) {
      setformValue(value)
      setValue(name, value)
    }

    return (
      <div {...outerProps}>
        <div className="flex">
          {label && (
            <label
              data-testid={`${props.testid && `${props.testid}-`}label`}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          )}
          <button type="button" title="Add Field" className="ml-3" onClick={handleAdd}>
            <PlusIcon className="h-5 text-indigo-600" />
          </button>
        </div>
        <Controller
          name={name}
          control={control}
          defaultValue={[{ id: "", text: "" }]}
          render={({ field: { onChange, value } }) => {
            function handleChange(i, event) {
              const value = [...formValue]
              value[i]!.text = event.target.value
              updateFormValue(value)
            }

            function handleRemove(i) {
              const value = [...formValue]
              value.splice(i, 1)
              updateFormValue(value)
            }

            return (
              <div className={label && "mt-1"}>
                {formValue.map((field, index) => {
                  return (
                    <div key={`${name}-${index}`} className="flex mt-1">
                      <LabeledTextField
                        {...props}
                        name={`${name}-${index}-${generateUUID()}`}
                        value={field.text}
                        testid={`${props.testid && `${props.testid}-`}input-${index}`}
                        onChange={(e) => handleChange(index, e)}
                      />
                      {formValue?.length > 1 && (
                        <button
                          type="button"
                          title="Remove"
                          className="mt-2 ml-3"
                          onClick={() => handleRemove(index)}
                        >
                          <XCircleIcon className="h-5 text-red-600" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }}
        />
      </div>
    )
  }
)

export default DynamicTextFields
