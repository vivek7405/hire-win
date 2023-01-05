import { SingleFileUploadField } from "src/core/components/SingleFileUploadField"
import { Form } from "src/core/components/Form"
import { UserObj } from "src/users/validations"
import LabeledTextField from "src/core/components/LabeledTextField"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import ThemePickerField from "src/core/components/ThemePickerField"
import Link from "next/link"
import { Routes } from "@blitzjs/next"
import { ExternalLinkIcon } from "@heroicons/react/outline"

type UserFormProps = {
  onSuccess?: () => void
  initialValues?: {}
  onSubmit: any
  header?: string
  subHeader?: string
  userId?: string
}

export const UserForm = (props: UserFormProps) => {
  return (
    <>
      <div className="bg-white w-full">
        <Form
          header={props.header}
          subHeader={props.subHeader}
          submitText="Submit"
          schema={UserObj}
          initialValues={props.initialValues}
          onSubmit={props.onSubmit}
          className="max-w-sm mx-auto"
        >
          <LabeledTextField
            name="name"
            label="Name"
            placeholder="Enter your name"
            testid="userUpdateName"
          />
          <LabeledTextField
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            testid="userUpdateEmail"
          />

          {/* <div className="float-left">
            <Link
              prefetch={true}
              href={Routes.ParentCompanyJobBoard({ userId: props.userId || "0" })}
              passHref
              legacyBehavior
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                className={`flex whitespace-nowrap items-center underline text-theme-600 hover:text-theme-800`}
              >
                <span>View Job Board</span>
                <ExternalLinkIcon className="w-4 h-4 ml-1" />
              </a>
            </Link>
          </div> */}
        </Form>
      </div>
    </>
  )
}

export default UserForm
