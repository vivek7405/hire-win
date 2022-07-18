import { AuthenticationError, Routes, useMutation, Link, Router, useRouter } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import toast from "react-hot-toast"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-gray-800 text-2xl font-medium">Welcome!</h1>
        <p className="text-gray-500">
          Enter your login details to access your account. Or{" "}
          <Link prefetch={true} href={Routes.SignupPage()} passHref>
            <a
              className="text-theme-600 hover:text-theme-900 font-medium"
              data-testid={`signupLink`}
            >
              Sign Up
            </a>
          </Link>
        </p>
      </div>
      <AuthForm
        testid="loginForm"
        submitText="Login"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const companyId = await loginMutation(values)
            if (companyId === "0") {
              router.push(Routes.NewCompany())
            }
            props.onSuccess?.()
          } catch (error) {
            if (error instanceof AuthenticationError) {
              toast.error("Sorry, those credentials are invalid")
            } else {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }
        }}
      >
        <LabeledTextField
          type="email"
          name="email"
          label="Email"
          placeholder="Email"
          testid="loginEmail"
        />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          testid="loginPassword"
        />
      </AuthForm>
    </div>
  )
}

export default LoginForm
