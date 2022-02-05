import { useRouter, BlitzPage, Head, Routes, Link, Image } from "blitz"
import { LoginForm } from "app/auth/components/LoginForm"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"

const LoginPage: BlitzPage = () => {
  const router = useRouter()
  return (
    <>
      <Head>
        <title>Login | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center space-y-6">
        <div>
          {/* <img src="/logo_color.svg" alt="hire-win Logo" className="mx-auto w-20 h-20" /> */}
          <div className="mx-auto w-20 h-20">
            <Image alt="hire.win" src={transparentLogoColored} />
          </div>
        </div>
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
                // router.push("/")
                window.location.href = "/"
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
