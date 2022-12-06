import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { BlitzPage, Routes } from "@blitzjs/next"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { AuthForm } from "src/auth/components/AuthForm"
import { ResetPassword } from "src/auth/validations"
import resetPassword from "src/auth/mutations/resetPassword"
import toast from "react-hot-toast"
import transparentLogoColored from "src/assets/logo_transparent_colored.png"
import LogoBrand from "src/assets/LogoBrand"

const ResetPasswordPage: BlitzPage = () => {
  const query = useRouter().query
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <>
      <Head>
        <title>Reset Password | hire-win</title>
      </Head>
      <div className="min-h-screen bg-gray-50 flex flex-col md:justify-center lg:justify-center items-center space-y-6">
        <Link href={Routes.Home()} legacyBehavior>
          <a className="w-56 lg:w-64 h-12 lg:h-14 mt-6 lg:mt-0 md:mt-0">
            <LogoBrand
              logoProps={{ fill: "#4f46e5", strokeWidth: 3 }}
              brandProps={{ fill: "#4f46e5" }}
            />
          </a>
        </Link>
        <h3 className="mt-4 text-2xl text-gray-800">Reset Your Password</h3>
        <div className="bg-white p-6 w-full max-w-xl">
          {isSuccess ? (
            <div>
              <h2>Password Reset Successfully</h2>
              <p>
                Go to the{" "}
                <Link href={Routes.JobsHome()} legacyBehavior>
                  homepage
                </Link>
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
