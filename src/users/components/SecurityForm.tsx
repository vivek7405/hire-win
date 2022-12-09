import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form } from "src/core/components/Form"
import { User } from "@prisma/client"
import { UserSecurity, UserSecurityWOCurrentPassword } from "src/auth/validations"
import { Routes } from "@blitzjs/next"
import Link from "next/link"

type SecurityFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
  user: User
}

export const SecurityForm = (props: SecurityFormProps) => {
  return (
    <>
      <div className="bg-white w-full">
        <Form
          header={props.header}
          subHeader={props.subHeader}
          submitText="Submit"
          schema={props.user.hashedPassword ? UserSecurity : UserSecurityWOCurrentPassword}
          initialValues={props.initialValues}
          onSubmit={props.onSubmit}
          className="max-w-sm mx-auto"
        >
          {/* Show Current password field only when hashed password is not null */}
          {/* Hashed password field will be null when the user has signed up with Google Auth */}
          {props.user.hashedPassword && (
            <LabeledTextField name="currentPassword" label="Current Password" type="password" />
          )}

          <LabeledTextField name="newPassword" label="New Password" type="password" />

          <LabeledTextField
            name="confirmNewPassword"
            label="Confirm New Password"
            type="password"
          />
        </Form>
      </div>
    </>
  )
}

export default SecurityForm
