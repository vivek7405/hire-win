import { useRouter, BlitzPage, Head, Routes, Link, Image, GetServerSidePropsContext } from "blitz"
import { LoginForm } from "app/auth/components/LoginForm"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import LogoBrand from "app/assets/LogoBrand"

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

const LoginPage: BlitzPage = () => {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Login | hire-win</title>
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

        <div className="bg-white p-6 w-full max-w-xl">
          <LoginForm
            onSuccess={() => {
              if (router.query.next) {
                let url = ""

                /*
                Loop through the router.query object and build the url string.

                If there are more params other than "next", make sure the second entry in the array is prepended with ? and everything else with &
              */

                for (const [index, [key, value]] of Object.entries(Object.entries(router.query))) {
                  url += `${Number(index) === 1 ? "?" : "&"}${key}=${value}`
                }

                // Then we push the newly built url, while remove the next param with regex
                // router.push(url.replace(/&next=/g, ""))
                window.location.href = url.replace(/&next=/g, "")
              } else {
                // router.push("/jobs")
                window.location.href = "/jobs"
              }
            }}
          />
        </div>

        <div>
          <p className="text-gray-400">
            Forgot your password?{" "}
            <Link href={Routes.ForgotPasswordPage()} passHref>
              <a className="text-theme-600 hover:text-theme-900 font-medium">Reset Password</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default LoginPage
