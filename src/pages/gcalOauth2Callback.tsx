import Link from "next/link"
import { useMutation } from "@blitzjs/rpc"
import { Router, useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import addGoogleCalendarCredentialsMutation from "src/calendars/googlecalendar/mutations/createCalendarCredentials"
import AuthLayout from "src/core/layouts/AuthLayout"
import { Suspense, useState } from "react"
import Form from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import toast from "react-hot-toast"

/**
 * This gets a code as a query parameter. This code needs to be sent to googleapi which returns a refresh_token. The refresh_token is used to generate a session_access_token.
 */
function OAuthCallbackPage() {
  const [isError, setIsError] = useState(false)
  const [isCalendarAdded, setIsCalendarAdded] = useState(false)
  const [addGoogleCalendarCredentials] = useMutation(addGoogleCalendarCredentialsMutation)
  const [calendarName, setCalendarName] = useState("Your Google Calendar")
  const router = useRouter()
  let { code } = useRouter().query

  const handleOAuthCode = async () => {
    setIsError(false)
    try {
      if (!code || Array.isArray(code)) {
        throw new Error(`Google Authentication failed with Code ${code}. Please try again.`)
      }

      await addGoogleCalendarCredentials({ oauthCode: code, name: calendarName })
      setIsCalendarAdded(true)
    } catch (error) {
      setIsError(true)
    }
  }

  const SettingsLink = () => {
    return (
      <Link href={Routes.UserSettingsCalendarsPage()} legacyBehavior>
        <a>Go to Calendar Settings</a>
      </Link>
    )
  }

  if (isError) {
    router.push(Routes.UserSettingsCalendarsPage())
    toast.error("Something went wrong while adding calendar")
    // return (
    //   <>
    //     <h1>An error has occurred</h1>
    //     <p>
    //       Please try again. Notice that this Google Calendar might already be connected to your
    //       account. If so please edit or delete it in the calendar settings.
    //     </p>
    //     <SettingsLink />
    //   </>
    // )
  }

  if (isCalendarAdded) {
    router.push(Routes.UserSettingsCalendarsPage())
    toast.success("Calendar added successfully")
    // return (
    //   <>
    //     <h3>Great! {calendarName} has been added.</h3>
    //     <SettingsLink />
    //   </>
    // )
  }

  return (
    <>
      {/* <h1>Your Authentication was succesful.</h1>
      <h3>Last step. Please choose a name for your new Calendar.</h3> */}
      {/* <Form>
        <Form.Group controlId="formGoogleCalendarName">
          <Form.Label>Calendar Name</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter a name you'd like for your calendar"
            onChange={(event) => setCalendarName(event.target.value)}
          />
          <Form.Text className="text-muted">
            {`This name helps you to recognize the calendar. For example "Private" or "My project with Alice".`}
          </Form.Text>
        </Form.Group>
      </Form>
      <Button variant="primary" onClick={handleOAuthCode}>
        Add Calendar
      </Button> */}
      <Form
        submitText="Submit"
        header="Your Authentication was succesful"
        subHeader="Last step. Please choose a name for your new Calendar."
        onSubmit={async (values) => {
          handleOAuthCode()
        }}
      >
        <LabeledTextField
          name="name"
          label="Calendar Name"
          placeholder="Enter a name you'd like for your calendar"
          onChange={(e) => setCalendarName(e.target.value)}
        />
      </Form>
    </>
  )
}

const GcalOAuth2Callback: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback="Loading ...">
        <OAuthCallbackPage />
      </Suspense>
    </div>
  )
}

GcalOAuth2Callback.authenticate = true
GcalOAuth2Callback.getLayout = (page) => (
  <AuthLayout title="Add your Google Calendar">{page}</AuthLayout>
)

export default GcalOAuth2Callback
