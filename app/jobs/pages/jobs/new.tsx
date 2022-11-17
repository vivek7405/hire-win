import {
  useRouter,
  InferGetServerSidePropsType,
  Routes,
  GetServerSidePropsContext,
  useMutation,
  useSession,
  getSession,
  ErrorComponent,
} from "blitz"
import AuthLayout from "app/core/layouts/AuthLayout"
import JobFormOld from "app/jobs/components/JobFormOld"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import toast from "react-hot-toast"
import Breadcrumbs from "app/core/components/Breadcrumbs"
import createJob from "app/jobs/mutations/createJob"
import path from "path"
import { convertToRaw } from "draft-js"
import { Category } from "@prisma/client"
import moment from "moment"
import Guard from "app/guard/ability"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Ensure these files are not eliminated by trace-based tree-shaking (like Vercel)
  // https://github.com/blitz-js/blitz/issues/794
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/__db.js")
  // End anti-tree-shaking
  const user = await getCurrentUserServer({ ...context })
  const session = await getSession(context.req, context.res)

  if (user) {
    const { can: canCreate } = await Guard.can("create", "job", { session }, {})
    if (canCreate) {
      return { props: { user: user } }
    } else {
      return {
        props: {
          error: {
            statusCode: 401,
            message: "You don't have permission",
          },
        },
      }
    }
  } else {
    return {
      redirect: {
        destination: "/login?next=index",
        permanent: false,
      },
      props: {},
    }
  }
}

const NewJob = ({ user, error }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()
  const session = useSession()
  const [createJobMutation] = useMutation(createJob)

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

  return (
    <AuthLayout title="New Job" user={user}>
      <Breadcrumbs ignore={[{ href: "/jobs", breadcrumb: "Jobs" }]} />
      <div className="mt-6">
        <JobFormOld
          companyId={session.companyId || "0"}
          user={user}
          header="Create A New Job"
          subHeader="Enter job details"
          initialValues={{
            name: "",
            validThrough: new Date(moment().add(1, "months").toISOString()),
          }}
          onSubmit={async (values) => {
            const toastId = toast.loading(() => <span>Creating Job</span>)
            try {
              if (values?.description) {
                values.description = convertToRaw(values?.description?.getCurrentContent())
              }

              const createdJob = await createJobMutation(values)
              toast.success(() => <span>Job Created</span>, { id: toastId })
              router.push(Routes.JobSettingsMembersPage({ slug: createdJob?.slug }))
            } catch (error) {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }}
        />
      </div>
    </AuthLayout>
  )
}

export default NewJob
