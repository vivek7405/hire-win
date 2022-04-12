import { useQuery } from "blitz"
import getURL from "../queries/getURL"

export const ConnectOutlookCalendarButton = (props) => {
  const [url] = useQuery(getURL, null)

  return (
    <a id={props.id} href={url}>
      {props.children}
    </a>
  )
}

export default ConnectOutlookCalendarButton
