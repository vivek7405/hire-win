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

import AddScheduleModal from "src/schedules/components/AddScheduleModal"
import Schedules from "src/schedules/components/Schedules"
import Breadcrumbs from "src/core/components/Breadcrumbs"
import SchedulingSettingsLayout from "src/core/layouts/SchedulingSettingsLayout"

export const getServerSideProps = gSSP(async (context: GetServerSidePropsContext) => {
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
        destination: "/auth/login?next=/settings/schedules",
        permanent: false,
      },
      props: {},
    }
  }
})

const UserSettingsAvailabilitiesPage = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="Hire.win | Availability Settings" user={user}>
      <Breadcrumbs ignore={[{ breadcrumb: "Jobs", href: "/jobs" }]} />
      <Suspense fallback="Loading...">
        <UserSettingsLayout>
          <SchedulingSettingsLayout>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 justify-between sm:items-center mb-6">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">Your Availabilities</h2>
                <h4 className="text-xs sm:text-sm text-gray-700 mt-1">
                  Add your availability to conduct interviews
                </h4>
                <h4 className="text-xs sm:text-sm text-gray-700">
                  You can map these availabilities to job stages
                </h4>
              </div>
            </div>
            <Suspense fallback="Loading...">
              <Schedules user={user} />
            </Suspense>
          </SchedulingSettingsLayout>
        </UserSettingsLayout>
      </Suspense>
    </AuthLayout>
  )
}

UserSettingsAvailabilitiesPage.suppressFirstRenderFlicker = true

export default UserSettingsAvailabilitiesPage
