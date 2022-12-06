import { useQuery } from "@blitzjs/rpc";
import { ExternalLinkIcon } from "@heroicons/react/outline"
import { PropsWithChildren } from "react"
import getCcalOAuthUrl from "../queries/createConnection"

export const ConnectGoogleCalendarButton = (
  props: PropsWithChildren<{
    id: string
  }>
) => {
  const [url] = useQuery(getCcalOAuthUrl, null)

  return (
    <a className="text-theme-600 underline flex items-center" id={props.id} href={url}>
      <span>{props.children}</span>
      <ExternalLinkIcon className="w-4 h-4 ml-1" />
    </a>
  )
}
