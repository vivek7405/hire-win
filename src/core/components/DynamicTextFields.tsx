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
        ? (errors[name] as any)[0]?.text?.message || errors[name]
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name?.charAt(0)?.toUpperCase() + name?.slice(1)}: ${error}`, {
          id: errors[name]?.message?.toString(),
        })
    }, [errors, name])

    const [fieldValues, setfieldValues] = useState(getValues(name) || [{ id: "", text: "" }])

    function handleAdd() {
      const values = [...fieldValues]
      values.push({ id: "", text: "" })
      updateFieldValues(values)
    }

    function updateFieldValues(values) {
      setfieldValues(values)
      setValue(name, values, { shouldDirty: true })
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
            <PlusIcon className="h-5 text-theme-600" />
          </button>
        </div>
        <Controller
          name={name}
          control={control}
          defaultValue={[{ id: "", text: "" }]}
          render={({ field: { onChange, value } }) => {
            function handleChange(i, event) {
              const values = [...fieldValues]
              values[i]!.text = event.target.value
              updateFieldValues(values)
            }

            function handleRemove(i) {
              const values = [...fieldValues]
              values.splice(i, 1)
              updateFieldValues(values)
            }

            return (
              <div className={label && "mt-1"}>
                {fieldValues.map((fieldValue, index) => {
                  return (
                    <div key={`${name}-${index}`} className="flex mt-1">
                      <LabeledTextField
                        {...props}
                        name={`${name}-${index}-${generateUUID()}`}
                        value={fieldValue.text}
                        testid={`${props.testid && `${props.testid}-`}input-${index}`}
                        onChange={(e) => handleChange(index, e)}
                      />
                      {fieldValues?.length > 1 && (
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
