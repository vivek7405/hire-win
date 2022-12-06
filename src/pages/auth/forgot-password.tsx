import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { useMutation } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { AuthForm } from "src/auth/components/AuthForm"
import { ForgotPassword } from "src/auth/validations"
import forgotPassword from "src/auth/mutations/forgotPassword"
import toast from "react-hot-toast"
import transparentLogoColored from "src/assets/logo_transparent_colored.png"
import LogoBrand from "src/assets/LogoBrand"

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  return (
    <>
      <Head>
        <title>Forgot Password | hire-win</title>
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
