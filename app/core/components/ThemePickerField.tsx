import { forwardRef, PropsWithoutRef, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import toast from "react-hot-toast"
import LabeledColorField from "./LabeledColorField"
import * as nearestColor from "nearest-color"
import {
  getColorValueFromTheme,
  getTailwindColors,
  getThemeFromColorValue,
} from "../utils/themeHelpers"

export interface ThemePickerFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  defaultValue?: string
}

export const ThemePickerField = forwardRef<HTMLInputElement, ThemePickerFieldProps>(
  ({ label, outerProps, name, defaultValue, ...props }, ref) => {
    const {
      control,
      formState: { isSubmitting, errors },
      setValue,
      getValues,
    } = useFormContext()

    const tailwindColors = getTailwindColors(true)
    const getNearestTailwindColor = nearestColor.from(tailwindColors) // returns a function

    const defaultColorValue = getColorValueFromTheme(getValues(name) || "indigo")
    const [userSelectedColorValue, setUserSelectedColorValue] = useState(defaultColorValue) // indigo-600
    const [nearestThemeColorObj, setNearestThemeColorObj] = useState({} as any)

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? errors[name]?.join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name?.charAt(0)?.toUpperCase() + name?.slice(1)}: ${error}`, {
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
            defaultValue={defaultValue || "#000000"}
            render={({ field: { onChange, value } }) => {
              return (
                <div className="flex items-center">
                  <div className="w-40">
                    <LabeledColorField
                      name="pickColor"
                      label="Pick Color"
                      testid="userUpdatePickColor"
                      defaultValue={nearestThemeColorObj?.value || defaultColorValue}
                      value={userSelectedColorValue}
                      onChange={(e) => {
                        setUserSelectedColorValue(e.target.value)
                        const nearestThemeColorObject = getNearestTailwindColor(e.target.value)
                        setNearestThemeColorObj(nearestThemeColorObject)
                        setValue(
                          name,
                          nearestThemeColorObj?.name?.replace("-600", "") ||
                            getThemeFromColorValue(defaultColorValue)
                        )
                      }}
                    />
                    <p>{userSelectedColorValue}</p>
                  </div>
                  <div className="mx-16">&#8594;</div>
                  <div className="w-40">
                    <LabeledColorField
                      name="appliedColor"
                      label="Applied Color"
                      testid="userUpdateAppliedColor"
                      // defaultValue={nearestThemeColorObj?.value || defaultColorValue}
                      value={nearestThemeColorObj?.value || defaultColorValue}
                      disabled={true}
                    />
                    <p>
                      {nearestThemeColorObj?.value || userSelectedColorValue} (
                      {nearestThemeColorObj?.name?.replace("-600", "") ||
                        getValues(name) ||
                        "indigo"}
                      )
                    </p>
                  </div>
                </div>
              )
            }}
          />
          {/* <input
            type="color"
            disabled={isSubmitting}
            {...register(`${name}` as const)}
            {...props}
            data-testid={`${props.testid && `${props.testid}-`}input`}
            className="border border-gray-300 block w-full sm:text-sm rounded"
          /> */}
        </div>
      </div>
    )
  }
)

export default ThemePickerField
