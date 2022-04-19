import React, { Suspense, useState } from "react"
import AuthLayout from "app/core/layouts/AuthLayout"
// import Card from "react-bootstrap/Card"
import {
  BlitzPage,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  Link,
  Routes,
} from "blitz"
import AddSchedule from "../components/AddScheduleModal"
// import SectionHeader from "app/users/components/SectionHeader"
// import SectionFooter from "app/users/components/SectionFooter"
import AllSchedules from "../components/AllSchedules"
import Skeleton from "react-loading-skeleton"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"

// const Schedules: BlitzPage = () => {
//   const [modalVisible, showOverlay] = useState(false)

//   return (
//     <Suspense fallback={<Skeleton count={10} />}>
//       {/* <Card>
//         <SectionHeader
//           title="My Schedules"
//           subtitle="A schedule describes when you are generally available. No meeting can be booked outsite of those time windows."
//         />
//         <AllSchedules />
//         <SectionFooter
//           variant="primary"
//           id="add-schedule-footer"
//           text="Add Schedule"
//           action={() => showOverlay(true)}
//         />
//       </Card> */}
//       <AllSchedules />
//       <AddSchedule show={modalVisible} setVisibility={showOverlay} />
//     </Suspense>
//   )
// }

// Schedules.authenticate = true

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")
  // End anti-tree-shaking

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return { props: { user: user } }
  } else {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
      props: {},
    }
  }
}

const SchedulesHome = ({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <AuthLayout title="SchedulesHome | hire-win" user={user}>
      {/* <Link href={Routes.NewStage()} passHref>
        <a className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
          New Schedule
        </a>
      </Link> */}
      <div className="float-right text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700">
        <AddSchedule />
      </div>

      <Suspense
        fallback={<Skeleton height={"120px"} style={{ borderRadius: 0, marginBottom: "6px" }} />}
      >
        <AllSchedules user={user} />
      </Suspense>
    </AuthLayout>
  )
}

SchedulesHome.authenticate = true

export default SchedulesHome
