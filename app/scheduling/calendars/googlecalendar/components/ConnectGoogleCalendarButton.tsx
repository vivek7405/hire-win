import { useQuery } from "blitz"
import { PropsWithChildren } from "react"
import getCcalOAuthUrl from "../queries/createConnection"

export const ConnectGoogleCalendarButton = (
  props: PropsWithChildren<{
    id: string
  }>
) => {
  const [url] = useQuery(getCcalOAuthUrl, null)

  return (
    <a id={props.id} href={url}>
      {props.children}
    </a>
  )
}
