import React from "react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { ExclamationIcon } from "@heroicons/react/outline"

type ModalProps = {
  open: boolean
  setOpen: (value: boolean) => void
  children: React.ReactNode
  header: string
  onSuccess: () => void
  hideConfirm?: boolean
  confirmText?: string
  hideCancel?: boolean
  cancelText?: string
}

export const Confirm = ({
  open,
  setOpen,
  children,
  header,
  onSuccess,
  hideConfirm,
  hideCancel,
  confirmText,
  cancelText,
}: ModalProps) => {
  return (
    <>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        {open && (
          <div className="h-screen fixed inset-0 z-50 !m-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        )}
        <AlertDialog.Content className="fixed p-4 md:p-6 bg-white top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-11/12 md:w-auto">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-4">
            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <AlertDialog.Title className="text-lg font-medium text-gray-900">
            {header}
          </AlertDialog.Title>
          {children}
          <div className="flex mt-4 justify-end">
            {!hideCancel && (
              <AlertDialog.Cancel className="mr-2 rounded-sm border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50">
                {cancelText || "Cancel"}
              </AlertDialog.Cancel>
            )}
            {!hideConfirm && (
              <AlertDialog.Action
                onClick={async (e) => {
                  e.preventDefault()
                  await onSuccess()
                }}
                className="rounded-sm border border-transparent px-4 py-2 bg-red-600 text-white hover:bg-red-700"
              >
                {confirmText || "Confirm"}
              </AlertDialog.Action>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  )
}

export default Confirm
