import Form from "app/core/components/Form"
import LabeledTextField from "app/core/components/LabeledTextField"
import AuthLayout from "app/core/layouts/AuthLayout"
import { BlitzPage, Link, useRouterQuery, invoke, Routes, useRouter } from "blitz"
import { Suspense, useState } from "react"
import toast from "react-hot-toast"
import handleOAuthCode from "../mutations/handleOAuthCode"

/**
 * This gets a code as a query parameter. This code needs to be sent to microsoft which returns a refresh_token. The refresh_token is used to generate a session_access_token.
 */
function OAuthCallbackPage() {
  const [isError, setIsError] = useState(false)
  const [isCalenderAdded, setIsCalenderAdded] = useState(false)
  const [calendarName, setCalendarName] = useState("Your Outlook Calendar")
  const router = useRouter()

  let { code } = useRouterQuery()
  const handleCode = async () => {
    setIsError(false)
    try {
      if (!code || Array.isArray(code))
        return <p>Microsoft Authentication failed with Code {code}. Please try again.</p>

      return await invoke(handleOAuthCode, { code: code, name: calendarName })
    } catch (error) {
      setIsError(true)
    }
  }
  const SettingsLink = () => {
    return (
      <Link href={Routes.UserSettingsCalendarsPage()}>
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
    //       Please try again. Notice that this Microsoft Calendar might already be connected to
    //       hire-win. If so please edit or delete it in the calendar settings.
    //     </p>
    //     <SettingsLink />
    //   </>
    // )
  }

  if (isCalenderAdded) {
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
                This name helps you to recognize the calendar. For example "Private" or "My project
                with Alice".
              </Form.Text>
            </Form.Group>
          </Form>
          <Button
            variant="primary"
            onClick={async () => {
              await handleCode()
              if (!isError) setIsCalenderAdded(true)
            }}
          >
            Add Calendar
          </Button> */}
      <Form
        submitText="Submit"
        header="Your Authentication was succesful"
        subHeader="Last step. Please choose a name for your new Calendar."
        onSubmit={async (values) => {
          await handleCode()
          if (!isError) setIsCalenderAdded(true)
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

const oAuth2Callback: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback="Loading ...">
        <OAuthCallbackPage />
      </Suspense>
    </div>
  )
}

oAuth2Callback.getLayout = (page) => (
  <AuthLayout title="Add your Google Calendar">{page}</AuthLayout>
)
oAuth2Callback.authenticate = true

export default oAuth2Callback
