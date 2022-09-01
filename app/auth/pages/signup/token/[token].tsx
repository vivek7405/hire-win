import {
  useRouter,
  BlitzPage,
  Head,
  Image,
  GetServerSidePropsContext,
  Link,
  Routes,
  ErrorComponent,
  InferGetServerSidePropsType,
  hash256,
} from "blitz"
import { SignupForm } from "app/auth/components/SignupForm"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"
import path from "path"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import LogoBrand from "app/assets/LogoBrand"
import getToken from "app/tokens/queries/getToken"

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  const user = await getCurrentUserServer({ ...context })
  const token = (context?.params?.token as string) || "0"
  const hashedToken = hash256(token)
  const tokenFromDB = await getToken({ where: { hashedToken } })

  if (tokenFromDB) {
    if (user) {
      return {
        redirect: {
          destination: "/jobs",
          permanent: false,
        },
        props: {},
      }
    }

    switch (tokenFromDB.type) {
      case "CONFIRM_EMAIL":
        return { props: { email: tokenFromDB?.sentTo } }
      case "INVITE_TO_COMPANY":
        return { props: { email: tokenFromDB?.sentTo, companyId: tokenFromDB?.companyId } }
      default:
        return { props: { email: tokenFromDB?.sentTo } }
    }
  } else {
    return {
      props: {
        error: {
          statusCode: 404,
          message: "Invalid token",
        },
      },
    }
  }
}

const SignupWithEmailConfirmedPage = ({
  email,
  companyId,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter()

  if (error) {
    return <ErrorComponent statusCode={error.statusCode} title={error.message} />
  }

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
          <SignupForm
            email={email}
            companyId={companyId}
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
                // router.push("/")
                window.location.href = "/jobs"
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

// SignupPage.redirectAuthenticatedTo = "/"

export default SignupWithEmailConfirmedPage
