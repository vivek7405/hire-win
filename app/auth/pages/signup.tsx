import { useRouter, BlitzPage, Head, Image } from "blitz"
import { SignupForm } from "app/auth/components/SignupForm"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Sign Up | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center space-y-6">
        <div>
          {/* <img src="/logo_color.svg" alt="hire-win Logo" className="mx-auto w-20 h-20" /> */}
          <div className="mx-auto w-20 h-20">
            <Image alt="hire.win" src={transparentLogoColored} />
          </div>
        </div>
        <div className="bg-white rounded p-6 w-full max-w-xl rounded shadow-sm">
          <SignupForm
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
      </div>
    </>
  )
}

// SignupPage.redirectAuthenticatedTo = "/"

export default SignupPage
