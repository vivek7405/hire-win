import { BlitzPage, useRouterQuery, Link, useMutation, Routes, Head, Image } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import { ResetPassword } from "app/auth/validations"
import resetPassword from "app/auth/mutations/resetPassword"
import toast from "react-hot-toast"
import transparentLogoColored from "app/assets/logo_transparent_colored.png"

const ResetPasswordPage: BlitzPage = () => {
  const query = useRouterQuery()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <>
      <Head>
        <title>Reset Password | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center space-y-6">
        <div>
          {/* <img src="/logo_color.svg" alt="hire-win Logo" className="mx-auto w-20 h-20" /> */}
          <div className="mx-auto w-20 h-20">
            <Image alt="hire.win" src={transparentLogoColored} />
          </div>
          <h3 className="mt-4 text-2xl text-gray-800">Reset Your Password</h3>
        </div>
        <div className="bg-white p-6 w-full max-w-xl">
          {isSuccess ? (
            <div>
              <h2>Password Reset Successfully</h2>
              <p>
                Go to the <Link href={Routes.JobsHome()}>homepage</Link>
              </p>
            </div>
          ) : (
            <AuthForm
              submitText="Reset Password"
              schema={ResetPassword}
              initialValues={{
                password: "",
                passwordConfirmation: "",
                token: query.token as string,
              }}
              className="space-y-6"
              onSubmit={async (values) => {
                try {
                  await resetPasswordMutation(values)
                } catch (error) {
                  if (error.name === "ResetPasswordError") {
                    toast.error(error.message)
                  } else {
                    toast.error("Sorry, we had an unexpected error. Please try again.")
                  }
                }
              }}
            >
              <LabeledTextField name="password" label="New Password" type="password" />
              <LabeledTextField
                name="passwordConfirmation"
                label="Confirm New Password"
                type="password"
              />
            </AuthForm>
          )}
        </div>
      </div>
    </>
  )
}

export default ResetPasswordPage
