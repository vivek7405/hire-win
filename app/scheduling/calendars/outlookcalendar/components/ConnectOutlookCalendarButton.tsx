import { ExternalLinkIcon } from "@heroicons/react/outline"
import { useQuery } from "blitz"
import getURL from "../queries/getURL"

export const ConnectOutlookCalendarButton = (props) => {
  const [url] = useQuery(getURL, null)

  return (
    <a className="text-theme-600 underline flex items-center" id={props.id} href={url}>
      <span>{props.children}</span>
      <ExternalLinkIcon className="w-4 h-4 ml-1" />
    </a>
  )
}

export default ConnectOutlookCalendarButton
