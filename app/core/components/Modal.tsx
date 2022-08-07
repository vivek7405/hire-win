import React, { Suspense } from "react"
import * as Dialog from "@radix-ui/react-dialog"

type ModalProps = {
  open: boolean
  setOpen: (value: boolean) => void
  children: React.ReactNode
  header: string
  noOverflow?: boolean
}

export const Modal = ({ open, setOpen, children, noOverflow }: ModalProps) => {
  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {open && (
          <div className="h-screen fixed inset-0 z-40 !m-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        )}
        <Dialog.Content
          className={`bg-white border-2 border-theme-300 rounded-md h-11/12 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-11/12 max-h-screen md:w-auto ${
            noOverflow ? "" : "overflow-auto"
          }`}
        >
          <Suspense fallback="Loading...">{children}</Suspense>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

export default Modal
