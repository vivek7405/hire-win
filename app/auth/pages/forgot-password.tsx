import { BlitzPage, useMutation, Head, Image, Link, Routes } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import { ForgotPassword } from "app/auth/validations"
import forgotPassword from "app/auth/mutations/forgotPassword"
import toast from "react-hot-toast"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"
import LogoBrand from "app/assets/LogoBrand"

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  return (
    <>
      <Head>
        <title>Forgot Password | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col md:justify-center lg:justify-center items-center space-y-6">
        <Link href={Routes.Home()}>
          <a className="w-auto h-12 mt-6 lg:h-14 lg:mt-0 md:mt-0">
            <LogoBrand
              logoProps={{ fill: "#4f46e5", strokeWidth: 3 }}
              brandProps={{ fill: "#4f46e5" }}
            />
          </a>
        </Link>
        <h3 className="mt-4 text-2xl text-gray-800">Forgot Password?</h3>
        <div className="bg-white p-6 w-full max-w-xl">
          {isSuccess ? (
            <div>
              <h2>Request Submitted</h2>
              <p>
                If your email is in our system, you will receive instructions to reset your password
                shortly.
              </p>
            </div>
          ) : (
            <AuthForm
              submitText="Send Reset Password Instructions"
              schema={ForgotPassword}
              initialValues={{ email: "" }}
              className="space-y-6"
              onSubmit={async (values) => {
                try {
                  await forgotPasswordMutation(values)
                } catch (error) {
                  toast.error("Sorry, we had an unexpected error. Please try again.")
                }
              }}
            >
              <LabeledTextField type="email" name="email" label="Email" placeholder="Email" />
            </AuthForm>
          )}
        </div>
      </div>
    </>
  )
}

ForgotPasswordPage.redirectAuthenticatedTo = "/"

export default ForgotPasswordPage
