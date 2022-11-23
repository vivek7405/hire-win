import { forwardRef, PropsWithoutRef, useMemo, useRef, useState } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import { dynamic } from "blitz"
import "react-quill/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

export interface LabeledQuillEditorProps extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label?: string
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  testid?: string
  toolbarHidden?: boolean
  readOnly?: boolean
  showTemplatePlaceholders?: boolean
  noBorder?: boolean
  showAsterisk?: boolean
}

export const LabeledQuillEditor = forwardRef<HTMLDivElement, LabeledQuillEditorProps>(
  (
    {
      label,
      outerProps,
      name,
      toolbarHidden,
      readOnly,
      showTemplatePlaceholders,
      noBorder,
      ...props
    },
    ref
  ) => {
    const {
      control,
      formState: { isSubmitting, errors },
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

    // const [Editor, setEditor] = useState(null as any)
    // useEffect(() => {
    //   setEditor(
    //     dynamic(
    //       () => {
    //         return import("react-quill").then((mod) => mod.default)
    //       },
    //       { ssr: false }
    //     ) as any
    //   )
    // }, [])

    const editorModules = {
      toolbar: [
        // [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: "" }, { align: "center" }, { align: "right" }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["clean"],
      ],
      clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: true,
      },
    }

    const editorFormats = [
      //   "header",
      //   "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "list",
      "bullet",
      //   "indent",
      "align",
      "color",
      "background",
      "link",
      "image",
      "video",
    ]

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
        <div className={label && "mt-1"}>
          <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => {
              return (
                <>
                  <ReactQuill
                    modules={editorModules}
                    formats={editorFormats}
                    placeholder={props.placeholder || ""}
                    theme="snow"
                    value={value}
                    onChange={onChange}
                  />
                </>
              )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledQuillEditor
