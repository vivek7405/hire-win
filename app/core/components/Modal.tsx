import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XIcon } from "@heroicons/react/outline"

type ModalProps = {
  open: boolean
  setOpen: (value: boolean) => void
  children: React.ReactNode
  header: string
}

export const Modal = ({ open, setOpen, children, header }: ModalProps) => {
  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {open && (
          <div className="h-screen fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity" />
        )}
        <Dialog.Content className="border-2 border-theme-300 rounded-md h-11/12 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-11/12 max-h-screen md:w-auto overflow-auto">
          {children}
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default Modal
