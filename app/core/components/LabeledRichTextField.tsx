import { forwardRef, PropsWithoutRef, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import { dynamic } from "blitz"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

export interface LabeledRichTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
}

export const LabeledRichTextField = forwardRef<HTMLDivElement, LabeledRichTextFieldProps>(
  ({ label, outerProps, name, ...props }, ref) => {
    const {
      register,
      control,
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
        <label
          data-testid={`${props.testid && `${props.testid}-`}label`}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1">
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => {
              const Editor = dynamic(
                () => {
                  return import("react-draft-wysiwyg").then((mod) => mod.Editor)
                },
                { ssr: false }
              ) as any

              return <Editor editorState={value} onEditorStateChange={onChange} />
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledRichTextField
