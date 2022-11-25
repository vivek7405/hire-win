import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
  useRouter,
  Routes,
  useMutation,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "app/users/components/UserForm"
import SecurityForm from "app/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "app/users/mutations/updateUser"
import changePassword from "app/auth/mutations/changePassword"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "app/core/utils/themeHelpers"
import UserSettingsLayout from "app/core/layouts/UserSettingsLayout"
import SubscribeButton from "app/users/components/SubscribeButton"
import { Plan } from "types"
import { CheckIcon } from "@heroicons/react/outline"
import { Suspense } from "react"

import Calendars from "app/scheduling/calendars/components/Calendars"
import Breadcrumbs from "app/core/components/Breadcrumbs"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  if (user) {
    return {
      props: {
        user: user,
      },
    }
  } else {
    return {
      redirect: {
        destination: "/login?next=settings/calendars",
        permanent: false,
      },
      props: {},
    }
  }
}

const UserSettingsCalendarsPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <UserSettingsLayout>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">Your Calendars</h2>
            <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
              Add your calendar where interviews shall be booked
            </h4>
            <h4 className="text-xs sm:text-sm text-gray-700">
              The default calendar you set shall be used for booking interviews
            </h4>
          </div>
        </div>
        <Suspense fallback="Loading...">
          <Calendars user={user as any} />
        </Suspense>
      </UserSettingsLayout>
    </AuthLayout>
  )
}

UserSettingsCalendarsPage.suppressFirstRenderFlicker = true

export default UserSettingsCalendarsPage
