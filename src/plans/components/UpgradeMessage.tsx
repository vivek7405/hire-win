import { Routes } from "@blitzjs/next"
import Link from "next/link"

type UpgradeMessagePropsType = {
  message: string
}
const UpgradeMessage = ({ message }: UpgradeMessagePropsType) => {
  return (
    <Link href={Routes.UserSettingsBillingPage()} legacyBehavior passHref>
      <a className="px-4 py-1 rounded-lg border bg-theme-50 border-theme-600 flex items-center space-x-2 text-theme-800">
        <span className="text-3xl">👉</span>
        <span>
          {message || "Upgrade"}, <span className="font-bold">Flat $29 monthly.</span>
        </span>
      </a>
    </Link>
  )
}

export default UpgradeMessage
