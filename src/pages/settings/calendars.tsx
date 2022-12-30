import { gSSP } from "src/blitz-server"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { useRouter } from "next/router"
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next"
import AuthLayout from "src/core/layouts/AuthLayout"
import getCurrentUserServer from "src/users/queries/getCurrentUserServer"
import path from "path"
import UserForm from "src/users/components/UserForm"
import SecurityForm from "src/users/components/SecurityForm"
import toast from "react-hot-toast"
import updateUser from "src/users/mutations/updateUser"
import changePassword from "src/auth/mutations/changePassword"
import { EditorState, convertFromRaw, convertToRaw } from "draft-js"
import { getColorValueFromTheme, getThemeFromColorValue } from "src/core/utils/themeHelpers"
import UserSettingsLayout from "src/core/layouts/UserSettingsLayout"
import SubscribeButton from "src/users/components/SubscribeButton"
import { Plan } from "types"
import { CheckIcon } from "@heroicons/react/outline"
import { Suspense } from "react"

import Calendars from "src/calendars/components/Calendars"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import getUser from "src/users/queries/getUser"

export const getServerSideProps = gSSP(async (context) => {
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
        destination: "/auth/login?next=/settings/calendars",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsCalendarsPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Hire.win | Calendar Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <UserSettingsLayout>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
            <div>
              <h2 className="text-lg leading-6 font-medium text-gray-900">Your Calendars</h2>
              <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                Your availability shall be checked across all the calendars you add
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
      </Suspense>
    </AuthLayout>
  )
}

UserSettingsCalendarsPage.suppressFirstRenderFlicker = true

export default UserSettingsCalendarsPage
