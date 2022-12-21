import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/outline"
import { useState } from "react"
import classNames from "src/core/utils/classNames"

type LinkCopyPopMenuItemProps = {
  companySlug?: string
  jobSlug?: string
  active: boolean
  label: string
}
const LinkCopyPopMenuItem = ({ companySlug, jobSlug, active, label }: LinkCopyPopMenuItemProps) => {
  const [copied, setCopied] = useState(false)

  return (
    <>
      <button
        className="w-full"
        onClick={(e) => {
          e.preventDefault()
          const baseURL =
            process.env.NODE_ENV === "production" ? "https://hire.win" : "http://localhost:3000"

          const companySlugAppend = companySlug ? `/${companySlug}` : ""
          const jobSlugAppend = jobSlug ? `/${jobSlug}` : ""

          const jobPostLink = `${baseURL}${companySlugAppend}${jobSlugAppend}`

          navigator.clipboard.writeText(jobPostLink)
          setCopied(true)
        }}
      >
        <div
          className={classNames(
            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "block px-4 py-2 text-sm",
            "flex items-center space-x-2 cursor-pointer"
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="w-5 h-5 text-neutral-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <ClipboardCopyIcon className="w-5 h-5 text-neutral-500" />
              <span>{label}</span>
            </>
          )}
        </div>
      </button>
    </>
  )
}

export default LinkCopyPopMenuItem
