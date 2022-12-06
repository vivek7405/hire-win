import Link from "next/link"
import { useMutation } from "@blitzjs/rpc"
import { Router, useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import addGoogleCalendarCredentialsMutation from "src/calendars/googlecalendar/mutations/createCalendarCredentials"
import AuthLayout from "src/core/layouts/AuthLayout"
import { Suspense, useEffect, useState } from "react"
import Form from "src/core/components/Form"
import LabeledTextField from "src/core/components/LabeledTextField"
import toast from "react-hot-toast"
import Navbar from "src/core/components/Navbar"
import { z } from "zod"

/**
 * This gets a code as a query parameter. This code needs to be sent to googleapi which returns a refresh_token. The refresh_token is used to generate a session_access_token.
 */
function OAuthCallbackPage() {
  const [isError, setIsError] = useState(false)
  const [isCalendarAdded, setIsCalendarAdded] = useState(false)
  const [addGoogleCalendarCredentials] = useMutation(addGoogleCalendarCredentialsMutation)
  const [calendarName, setCalendarName] = useState("Your Google Calendar")
  const router = useRouter()
  let { code } = router.query

  // parsing code from router query param takes time
  // Used loader to avoid flicker between authenticated and unauthenticated UI
  const [isLoading, setIsLoading] = useState(true)
  setTimeout(() => {
    setIsLoading(false)
  }, 1000)

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
            handleOAuthCode()
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

const GcalOAuth2Callback: BlitzPage = () => {
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

GcalOAuth2Callback.authenticate = true
GcalOAuth2Callback.getLayout = (page) => (
  <AuthLayout title="Add your Google Calendar">{page}</AuthLayout>
)

export default GcalOAuth2Callback
