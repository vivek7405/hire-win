import addCalendarMutation from "../mutations/addCalendar"
import { invalidateQuery, useMutation, Link } from "blitz"
import getCalendars from "../queries/getCalendars"
import styles from "./AddCalendar.module.css"
import { useState } from "react"
import { ConnectGoogleCalendarButton } from "app/scheduling/calendars/googlecalendar/components/ConnectGoogleCalendarButton"
import { ConnectOutlookCalendarButton } from "app/scheduling/calendars/outlookcalendar/components/ConnectOutlookCalendarButton"
import { AddCalendarInput } from "../validations"
import getDefaultCalendarByUser from "../queries/getDefaultCalendarByUser"
import Form from "app/core/components/Form"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import LabeledTextField from "app/core/components/LabeledTextField"

interface AddCalendarProps {
  onClose?: any
}
const AddCalendarForm = (props: AddCalendarProps) => {
  const [createCalendar] = useMutation(addCalendarMutation)
  const [calendarType, setCalendarType] = useState("caldav")
  const [error, setError] = useState({ error: false, message: "" })
  const [message, setMessage] = useState("")

  return (
    <div>
      <Form
        header="New Calendar"
        subHeader="Connect & add a new calendar"
        submitText="Submit"
        onSubmit={async (e) => {
          e.preventDefault()

          const form = new FormData(e.currentTarget)

          const type = form.get("type") as string
          const name = form.get("name") as string
          const url = form.get("url") as string
          const username = form.get("username") as string
          const password = form.get("password") as string

          const parseResult = AddCalendarInput.safeParse({
            type,
            url,
            name,
            password,
            username,
          })

          if (!parseResult.success) {
            setMessage(parseResult.error.errors[0]?.message || "")
            return
          }

          const { fail } = await createCalendar({
            name,
            password,
            // CaldavDigest may be changed to CaldavBasic depending on
            // which auth worked while trying to connect
            // Refer to the mutation logic for more details
            type: type === "google" ? "GoogleCalendar" : "CaldavDigest",
            url,
            username,
          })

          if (fail) {
            setError({ error: true, message: fail })
            return
          } else {
            setError({ error: false, message: "" })
            await invalidateQuery(getCalendars)
            await invalidateQuery(getDefaultCalendarByUser)
            props.onClose && props.onClose()
          }
        }}
      >
        {/* <Form.Label>Type</Form.Label> */}
        {/* <Form.Control
          as="select"
          name="type"
          placeholder="Please select a type"
          defaultValue={calendarType}
          onChange={(event) => {
            setCalendarType(event.target.value)
          }}
        >
          <option value="caldav">CalDav</option>
          <option value="google">Google Calendar</option>
          <option value="outlook">Microsoft Outlook</option>
        </Form.Control> */}
        <LabeledReactSelectField
          name="type"
          label="Type"
          options={[
            { label: "CalDav", value: "caldav" },
            { label: "Google Calendar", value: "google" },
            { label: "Microsoft Outlook", value: "outlook" },
          ]}
          onChange={(value) => {
            setCalendarType(value as any)
          }}
        />
        {calendarType === "caldav" && <CalDavFormBody />}
        {calendarType === "google" && <GoogleFormBody />}
        {calendarType === "outlook" && <OutlookFormBody />}
        {error.error && (
          <div className="text-red-900">Could not connect successfully: {error.message}</div>
        )}
        <div className="text-red-600">{message}</div>
        {/* <div className="p-3 d-flex justify-content-end">
          <button
            className="mx-1"
            onClick={() => {
              props.onClose && props.onClose()
            }}
          >
            Cancel
          </button>
          {calendarType === "caldav" && (
            <button className="mx-1" type="submit">
              Add
            </button>
          )}
        </div> */}
      </Form>
    </div>
  )
}

const CalDavFormBody = () => {
  const [url, setUrl] = useState<string>("")

  return (
    <>
      <div className="w-96" />
      <LabeledTextField
        name="name"
        label="Calendar name"
        placeholder="Enter a name for your calendar"
      />
      <LabeledTextField
        name="url"
        label="Calendar URL"
        placeholder="Enter the URL to connect your CalDav calendar"
        type="url"
        onChange={(e) => setUrl(e.target.value)}
      />
      {url.includes("remote.php") && !url.includes("remote.php/dav") && (
        <div className="text-theme-500">
          * It seems you are trying to connect a Nextcloud instance. Please use a URL of the
          following form:
          <br />
          <code>{"/remote.php/dav/calendars/<username>/<calendar-name>"}</code>
        </div>
      )}
      <LabeledTextField name="username" label="Username" placeholder="CalDav calendar username" />
      <LabeledTextField
        name="password"
        type="password"
        label="Password"
        placeholder="CalDav calendar password"
      />
    </>
  )
}

const GoogleFormBody = () => {
  return (
    <>
      <p>Please provide access to your Google Calendar</p>
      <ConnectGoogleCalendarButton id="google-login-button">
        Go to Google Login
      </ConnectGoogleCalendarButton>
    </>
  )
}

const OutlookFormBody = () => {
  return (
    <>
      <p>Please provide access to your Outlook Calendar</p>
      <ConnectOutlookCalendarButton id="outlook-login-button">
        Go to Microsoft Login
      </ConnectOutlookCalendarButton>
    </>
  )
}

export default AddCalendarForm
