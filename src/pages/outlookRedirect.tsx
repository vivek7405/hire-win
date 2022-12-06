import { useRouter } from "next/router"
import Link from "next/link"
import { invoke } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import Form from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import AuthLayout from "src/core/layouts/AuthLayout"
import { Suspense, useEffect, useState } from "react"
import toast from "react-hot-toast"
import handleOAuthCode from "src/calendars/outlookcalendar/mutations/handleOAuthCode"
import Navbar from "src/core/components/Navbar"
import { z } from "zod"

/**
 * This gets a code as a query parameter. This code needs to be sent to microsoft which returns a refresh_token. The refresh_token is used to generate a session_access_token.
 */
function OAuthCallbackPage() {
  const [isError, setIsError] = useState(false)
  const [isCalenderAdded, setIsCalenderAdded] = useState(false)
  const [calendarName, setCalendarName] = useState("Your Outlook Calendar")
  const router = useRouter()
  let { code } = router.query

  // parsing code from router query param takes time
  // Used loader to avoid flicker between authenticated and unauthenticated UI
  const [isLoading, setIsLoading] = useState(true)
  setTimeout(() => {
    setIsLoading(false)
  }, 1000)

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

  return isLoading ? (
    <>
      <Form header="Authenticating..." onSubmit={async () => {}}>
        <p className="text-neutral-500">It won't take a second!</p>
      </Form>
    </>
  ) : (
    <>
      {code ? (
        <Form
          submitText="Submit"
          header="Your Authentication was succesful"
          subHeader="Last step. Please choose a name for your new Calendar."
          onSubmit={async (values) => {
            await handleCode()
            if (!isError) setIsCalenderAdded(true)
          }}
          schema={z.object({
            name: z.string().nonempty({ message: "Calendar name is required" }),
          })}
        >
          <LabeledTextField
            name="name"
            label="Calendar Name"
            placeholder="Enter a name you'd like for your calendar"
            onChange={(e) => setCalendarName(e.target.value)}
          />
        </Form>
      ) : (
        <Form
          header="Authentication Failed"
          subHeader="We were not able to authenticate your calendar"
          onSubmit={async () => {}}
        >
          <button
            className="px-4 py-2 bg-theme-600 hover:bg-theme-700 rounded text-white"
            onClick={() => {
              router.replace(Routes.UserSettingsCalendarsPage())
            }}
          >
            Go back to Calendar Settings
          </button>
        </Form>
      )}
    </>
  )
}

const oAuth2Callback: BlitzPage = () => {
  return (
    <>
      <Navbar showEmptyNavbar={true} />
      <div className="max-w-lg mx-auto">
        <div className="mt-6">
          <Suspense fallback="Loading ...">
            <OAuthCallbackPage />
          </Suspense>
        </div>
      </div>
    </>
  )
}

oAuth2Callback.getLayout = (page) => (
  <AuthLayout title="Add your Google Calendar">{page}</AuthLayout>
)
oAuth2Callback.authenticate = true

export default oAuth2Callback
