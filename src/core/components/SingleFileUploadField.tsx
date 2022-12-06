import React, { PropsWithoutRef, useMemo, useState } from "react"
import { useFormContext, Controller } from "react-hook-form"
import axios from "axios"
import { useDropzone } from "react-dropzone"
import { TrashIcon } from "@heroicons/react/outline"
import { AttachmentObject } from "types"
import toast from "react-hot-toast"
import { getAntiCSRFToken } from "@blitzjs/auth"

export interface SingleFileUploadProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  subLabel?: string
  subLabel2?: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  onSubmit?: (e) => void
  accept: string
  showImage?: boolean
  showAsterisk?: boolean
}

export const SingleFileUploadField = React.forwardRef<HTMLInputElement, SingleFileUploadProps>(
  ({ label, subLabel, subLabel2, name, outerProps, defaultValue, ...props }, ref) => {
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
        ? (errors[name] as any)?.join(", ")
        : errors[name]?.message || errors[name]

      error &&
        toast.error(`${name?.charAt(0)?.toUpperCase() + name?.slice(1)}: ${error}`, {
          id: errors[name]?.message?.toString(),
        })
    }, [errors, name])

    const [isUploading, setIsUploading] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)

    const onDrop = React.useCallback(
      async (droppedFiles, fileRejections) => {
        setIsUploading(true)

        let rejectionCount = 0
        let errorCount = 0
        try {
          fileRejections?.forEach((file) => {
            rejectionCount++
            file.errors?.forEach((error) => {
              errorCount++
              if (error.code === "file-too-large") {
                toast.error(`Upload a file with size less than 1 MB`)
              } else if (error.code === "file-invalid-type") {
                toast.error(`Invalid file type`)
              } else if (error.code === "too-many-files") {
                toast.error("Only one file allowed")
              } else {
                toast.error(`File upload error: ${error.message}`)
              }
            })
          })
          if (rejectionCount > 0 && errorCount === 0) {
            toast.error(`Something went wrong while uploading file`)
          }
        } catch (error) {
          errorCount++
          toast.error(`File upload error: ${error.message}`)
        }

        if (rejectionCount === 0 && errorCount === 0) {
          const resp = await fileUpload(droppedFiles[0])
          setValue(
            `${name}` as const,
            {
              name: droppedFiles[0]?.name || "",
              key: resp.data?.Key,
              location: resp.data?.Location,
            },
            { shouldValidate: true }
          )
        }

        setIsUploading(false)
      },
      [setValue, name, setIsUploading]
    )

    const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: props.accept,
      maxSize: 1048576,
      maxFiles: 1,
    })

    const fileUpload = async (file) => {
      const antiCSRFToken = getAntiCSRFToken()
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/uploadFile`
      const formData = new FormData()
      formData.append("file", file)
      const config = {
        headers: {
          "content-type": "multipart/form-data",
          "anti-csrf": antiCSRFToken,
        },
      }

      const resp = await axios.post(url, formData, config)

      return resp
    }

    const removeFile = async () => {
      setIsRemoving(true)

      const antiCSRFToken = getAntiCSRFToken()
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/removeFile`
      const config = {
        headers: {
          "content-type": "application/json",
          "anti-csrf": antiCSRFToken,
        },
      }
      await axios.post(url, file, config)
      setValue(`${name}` as const, {}, { shouldValidate: false })
      props.onSubmit && handleSubmit(props.onSubmit)()

      setIsRemoving(false)
    }

    return (
      <div className="w-full" {...outerProps}>
        <Controller
          name={`${name}` as const}
          control={control}
          defaultValue={defaultValue || { name: "", key: "", location: "" }}
          render={() => (
            <>
              {file && file.key && file.key !== "" ? (
                <div className="w-full">
                  {label && (
                    <label className="block text-sm font-medium text-gray-700">
                      {label} {props.showAsterisk && "*"}
                    </label>
                  )}
                  {subLabel && <label className="block text-xs text-gray-600">{subLabel}</label>}
                  {subLabel2 && <label className="block text-xs text-gray-600">{subLabel2}</label>}
                  <div className={label && "mt-1"}>
                    {!isRemoving && (
                      <>
                        {props.showImage && (
                          <div className="flex">
                            <img
                              src={file?.location}
                              alt="logo"
                              width={200}
                              className="self-center"
                            />
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
                                href={file.location}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {file.name}
                              </a>
                              <button
                                title="remove"
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
                      </>
                    )}
                    {isRemoving && <p className="text-sm text-gray-600">Removing...</p>}
                  </div>
                </div>
              ) : (
                <div {...getRootProps({ className: "btn-dropzone" })}>
                  {label && (
                    <label className="block text-sm font-medium text-gray-700">
                      {label} {props.showAsterisk && "*"}
                    </label>
                  )}
                  {subLabel && <label className="block text-xs text-gray-600">{subLabel}</label>}
                  {subLabel2 && <label className="block text-xs text-gray-600">{subLabel2}</label>}
                  <div className={label && "mt-1"}>
                    <div className="flex justify-center px-6 pt-5 pb-6 border border-gray-300 rounded">
                      <div className="flex flex-col text-center text-sm text-gray-600">
                        {!isUploading && (
                          <>
                            <div className="flex flex-col lg:flex-row">
                              <p className="lg:mr-1">Drag and drop file here, </p>
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer font-medium text-theme-600 hover:text-theme-500"
                              >
                                <button onClick={(e) => e.preventDefault()}>
                                  {" "}
                                  or click to select
                                </button>
                                <input
                                  {...props}
                                  {...getInputProps()}
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                />
                              </label>
                            </div>

                            <p className="text-xs text-gray-500">Max 1MB</p>
                          </>
                        )}
                        {isUploading && <p>Uploading...</p>}
                      </div>
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
