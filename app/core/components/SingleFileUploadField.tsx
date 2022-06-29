import React, { PropsWithoutRef, useMemo } from "react"
import { useFormContext, Controller } from "react-hook-form"
import axios from "axios"
import { useDropzone } from "react-dropzone"
import { TrashIcon } from "@heroicons/react/outline"
import { AttachmentObject } from "types"
import toast from "react-hot-toast"

export interface SingleFileUploadProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  onSubmit?: (e) => void
  accept: string
  showImage?: boolean
}

export const SingleFileUploadField = React.forwardRef<HTMLInputElement, SingleFileUploadProps>(
  ({ label, name, outerProps, defaultValue, ...props }, ref) => {
    const {
      control,
      setValue,
      watch,
      handleSubmit,
      formState: { isSubmitting, errors },
    } = useFormContext()

    const file: AttachmentObject = watch(`${name}` as const)

    useMemo(() => {
      const error = Array.isArray(errors[name])
        ? errors[name].join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${error}`, {
          id: errors[name],
        })
    }, [errors, name])

    const onDrop = React.useCallback(
      async (droppedFiles) => {
        const resp = await fileUpload(droppedFiles[0])
        setValue(`${name}` as const, resp.data, { shouldValidate: true })
      },
      [setValue, name]
    )

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: props.accept,
    })

    const fileUpload = async (file) => {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/uploadFile`
      const formData = new FormData()
      formData.append("file", file)
      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      }

      const resp = await axios.post(url, formData, config)

      return resp
    }

    const removeFile = async () => {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/removeFile`
      const config = {
        headers: {
          "content-type": "application/json",
        },
      }
      await axios.post(url, file, config)
      setValue(`${name}` as const, {}, { shouldValidate: false })
      props.onSubmit && handleSubmit(props.onSubmit)()
    }

    return (
      <div className="w-full" {...outerProps}>
        <Controller
          name={`${name}` as const}
          control={control}
          defaultValue={defaultValue || { Key: "", Location: "" }}
          render={() => (
            <>
              {file && file.Key && file.Key !== "" ? (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  {props.showImage && (
                    <div className="flex">
                      <img src={file?.Location} alt="logo" width={200} className="self-center" />
                      <div>
                        <button
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-800 m-2"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            removeFile()
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {!props.showImage && (
                    <div>
                      <div>
                        <a
                          className="text-theme-600 hover:text-theme-500"
                          href={file.Location}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {file.Key}
                        </a>
                        <button
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-800 m-2"
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            removeFile()
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div {...getRootProps({ className: "btn-dropzone" })}>
                  <label className="block text-sm font-medium text-gray-700">{label}</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-gray-300 rounded">
                    <div className="flex flex-col text-center text-sm text-gray-600">
                      <div className="flex flex-col lg:flex-row">
                        <p className="lg:mr-1">Drag and drop file here, </p>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer font-medium text-theme-600 hover:text-theme-500"
                        >
                          <button onClick={(e) => e.preventDefault()}> or click to select</button>
                          <input
                            {...props}
                            {...getInputProps()}
                            id="file-upload"
                            name="file-upload"
                            type="file"
                          />
                        </label>
                      </div>

                      <p className="text-xs text-gray-500">Max 10MB</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        />
      </div>
    )
  }
)

export default SingleFileUploadField
