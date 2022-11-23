import { forwardRef, PropsWithoutRef, useEffect, useMemo, useState } from "react"
import { useFormContext, Controller } from "react-hook-form"
import toast from "react-hot-toast"
import { dynamic } from "blitz"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import TemplatePlaceholders from "app/email-templates/components/TemplatePlaceholders"
import styles from "./LabeledRichTextField.module.css"

const Editor = dynamic(
  () => {
    return import("react-draft-wysiwyg").then((mod) => mod.Editor)
  },
  { ssr: false }
) as any

export interface LabeledRichTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["div"]> {
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

export const LabeledRichTextField = forwardRef<HTMLDivElement, LabeledRichTextFieldProps>(
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
    //         return import("react-draft-wysiwyg").then((mod) => mod.Editor)
    //       },
    //       { ssr: false }
    //     ) as any
    //   )
    // }, [])

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
              // return Editor ? (
              return (
                <Editor
                  wrapperClassName={!noBorder ? styles.reactDraftWrapperClass : ""}
                  editorClassName={!noBorder ? styles.reactDraftEditorClass : ""}
                  toolbarClassName={!noBorder ? styles.reactDraftToolbarClass : ""}
                  toolbarHidden={toolbarHidden}
                  readOnly={readOnly}
                  editorState={value}
                  onEditorStateChange={onChange}
                  toolbarCustomButtons={[
                    showTemplatePlaceholders ? (
                      <TemplatePlaceholders key={0} editorState={value} onChange={onChange} />
                    ) : (
                      <></>
                    ),
                  ]}
                  toolbar={{
                    inline: { inDropdown: true },
                    list: { inDropdown: true },
                    textAlign: { inDropdown: true },
                    // link: { inDropdown: true },
                    // history: { inDropdown: true },
                  }}
                />
              )
              // : (
              //   <></>
              // )
            }}
          />
        </div>
      </div>
    )
  }
)

export default LabeledRichTextField
