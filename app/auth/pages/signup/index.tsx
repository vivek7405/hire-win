import {
  useRouter,
  BlitzPage,
  Head,
  Image,
  GetServerSidePropsContext,
  Link,
  Routes,
  useMutation,
} from "blitz"
import { SignupForm } from "app/auth/components/SignupForm"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import LogoBrand from "app/assets/LogoBrand"
import Form from "app/core/components/Form"
import LabeledTextField from "app/core/components/LabeledTextField"
import AuthForm from "app/auth/components/AuthForm"
import { z } from "zod"
import confirmEmail from "app/auth/mutations/confirmEmail"
import toast from "react-hot-toast"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  const user = await getCurrentUserServer({ ...context })

  if (user) {
    return {
      redirect: {
        destination: "/jobs",
        permanent: false,
      },
      props: {},
    }
  }

  return { props: {} }
}

const SignupPage: BlitzPage = () => {
  const router = useRouter()
  const [confirmEmailMutation] = useMutation(confirmEmail)

  return (
    <>
      <Head>
        <title>Sign Up | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col md:justify-center lg:justify-center items-center space-y-6">
        <Link href={Routes.Home()}>
          <a className="w-56 lg:w-64 h-12 lg:h-14 mt-6 lg:mt-0 md:mt-0">
            <LogoBrand
              logoProps={{ fill: "#4f46e5", strokeWidth: 3 }}
              brandProps={{ fill: "#4f46e5" }}
            />
          </a>
        </Link>

        <div className="bg-white rounded p-6 w-full max-w-xl shadow-sm">
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h1 className="text-gray-800 text-2xl font-medium">Start Your Journey</h1>
              <p className="text-gray-500">
                Already have an account?{" "}
                <Link href={Routes.LoginPage()} passHref>
                  <a className="text-theme-600 hover:text-theme-900 font-medium">Login</a>
                </Link>
              </p>
            </div>
            <AuthForm
              testid="signupForm"
              submitText="Send Confirmation"
              schema={z.object({
                email: z.string().email(),
              })}
              onSubmit={async (values) => {
                const toastId = toast.loading("Sending confirmation mail")

                try {
                  await confirmEmailMutation(values)
                  toast.success("Confirmation mail sent. Check your inbox to confirm.", {
                    id: toastId,
                    duration: 5000,
                  })
                } catch (error) {
                  if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                    // This error comes from Prisma
                    toast.error("This email is already being used", { id: toastId })
                  } else {
                    toast.error(error.toString(), { id: toastId })
                  }
                }
              }}
            >
              <LabeledTextField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                autoFocus={true}
              />
              <div className="text-xs text-neutral-500">
                By signing up, you agree to the{" "}
                <Link href={Routes.Terms()}>
                  <a target="_blank" className="text-indigo-600 underline">
                    Terms of Service
                  </a>
                </Link>{" "}
                and{" "}
                <Link href={Routes.Privacy()}>
                  <a target="_blank" className="text-indigo-600 underline">
                    Privacy Policy
                  </a>
                </Link>
                , including{" "}
                <Link href={Routes.Cookies()}>
                  <a target="_blank" className="text-indigo-600 underline">
                    Cookie Use
                  </a>
                </Link>
                .
              </div>
            </AuthForm>
          </div>
          {/* <SignupForm
            onSuccess={() => {
              if (router.query.next) {
                let url = ""

                // Loop through the router.query object and build the url string.
                // If there are more params other than "next", make sure the second entry in the array is prepended with ? and everything else with &
                for (const [index, [key, value]] of Object.entries(Object.entries(router.query))) {
                  url += `${Number(index) === 1 ? "?" : "&"}${key}=${value}`
                }

                // Then we push the newly built url, while remove the next param with regex
                // router.push(url.replace(/&next=/g, ""))
                window.location.href = url.replace(/&next=/g, "")
              } else {
                // router.push("/")
                window.location.href = "/"
              }
            }}
          /> */}
        </div>
      </div>
    </>
  )
}

// SignupPage.redirectAuthenticatedTo = "/"

export default SignupPage
