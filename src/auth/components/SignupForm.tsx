import Link from "next/link"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { AuthForm } from "src/auth/components/AuthForm"
import signup from "src/auth/mutations/signup"
import { Signup } from "src/auth/validations"
import toast from "react-hot-toast"
import { z } from "zod"
import LabeledToggleGroupField from "src/core/components/LabeledToggleGroupField"
import { Currency } from "types"
import { useState } from "react"
import LocaleCurrency from "locale-currency"
import { CompanyUserRole } from "@prisma/client"
import { useRouter } from "next/router"

type SignupFormProps = {
  onSuccess?: () => void
  companyId?: string | null | undefined
  companyUserRole?: CompanyUserRole
  email?: string | null | undefined
}

export const SignupForm = (props: SignupFormProps) => {
  const router = useRouter()
  const [signupMutation] = useMutation(signup)
  // const localeCurrency = LocaleCurrency.getCurrency(navigator.language || "en-US") || Currency.USD
  // const [selectedCurrency, setSelectedCurrency] = useState(Currency[localeCurrency] || Currency.USD)

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-gray-800 text-xl font-medium">Start Your Journey</h1>
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link
            prefetch={true}
            href={`${Routes.LoginPage().pathname}${
              router.query.next ? `?next=${router.query.next}` : ""
            }`}
            passHref
            legacyBehavior
          >
            <a className="text-theme-600 hover:text-theme-900 font-medium">Login</a>
          </Link>
        </p>
      </div>
      <AuthForm
        testid="signupForm"
        submitText="Create Account"
        schema={z.object({
          name: z.string().nonempty({ message: "Required" }),
          email:
            !props.email || props.email === ""
              ? z.string().email().nonempty({ message: "Required" })
              : z.string().optional(),
          companyName:
            !props.companyId || props.companyId === "0"
              ? z.string().nonempty({ message: "Required" })
              : z.string().optional(),
          companyId: z.string().optional(),
          password: z.string().nonempty({ message: "Required" }),
          // currency:
          //   !props.email || props.email === ""
          //     ? z.nativeEnum(Currency)
          //     : z.nativeEnum(Currency).optional(),
        })}
        initialValues={{ email: props.email || "", password: "" }}
        onSubmit={async (values) => {
          try {
            values["companyId"] = props.companyId || "0"
            values["email"] = values["email"] || ""
            values["timezone"] = Intl?.DateTimeFormat()
              ?.resolvedOptions()
              ?.timeZone?.replace("Calcutta", "Kolkata")
            if (props.companyUserRole) {
              values["companyUserRole"] = props.companyUserRole
            }
            await signupMutation(values)
            props.onSuccess?.()
          } catch (error) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
              // This error comes from Prisma
              toast.error("This email is already being used")
            } else {
              toast.error(error.toString())
            }
          }
        }}
      >
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Enter your name"
          testid="signupName"
        />
        {(!props.email || props.email === "") && (
          <LabeledTextField
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            testid="signupEmail"
          />
        )}
        {(!props.companyId || props.companyId === "0") && (
          <LabeledTextField
            name="companyName"
            label="Company Name"
            placeholder="Make it as short as possible, eg. Acme instead of Acme Inc."
            testid="signupCompanyName"
          />
        )}
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Enter a password for your account"
          type="password"
          testid="signupPassword"
        />
        {/* {(!props.email || props.email === "") && (
          <LabeledToggleGroupField
            name="currency"
            label="Preferred currency for billing"
            paddingX={3}
            paddingY={1}
            value={selectedCurrency}
            options={Object.keys(Currency).map((currency) => {
              return { label: currency, value: currency }
            })}
            onChange={async (value) => {
              setSelectedCurrency(value)
            }}
          />
        )} */}
        <div>
          <label className="text-xs text-neutral-500">
            By signing up, you agree to the{" "}
            <Link href={Routes.Terms()} legacyBehavior>
              <a target="_blank" className="text-indigo-600 underline">
                Terms of Service
              </a>
            </Link>{" "}
            and{" "}
            <Link href={Routes.Privacy()} legacyBehavior>
              <a target="_blank" className="text-indigo-600 underline">
                Privacy Policy
              </a>
            </Link>
            , including{" "}
            <Link href={Routes.Cookies()} legacyBehavior>
              <a target="_blank" className="text-indigo-600 underline">
                Cookie Use
              </a>
            </Link>
            .
          </label>
        </div>
      </AuthForm>
    </div>
  )
}

export default SignupForm
