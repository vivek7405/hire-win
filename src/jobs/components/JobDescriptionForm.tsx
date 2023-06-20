import { useQuery } from "@blitzjs/rpc"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Job } from "src/jobs/validations"
import LabeledRichTextField from "src/core/components/LabeledRichTextField"
import { Category, SalaryType, JobType, RemoteOption } from "@prisma/client"
import LabeledReactSelectField from "src/core/components/LabeledReactSelectField"
import { Suspense, useEffect, useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "src/core/components/CheckboxField"
import { titleCase } from "src/core/utils/titleCase"
import LabeledTextValidatedField from "src/core/components/LabeledTextValidatedField"
import ApplicationForm from "../../candidates/components/ApplicationForm"
import toast from "react-hot-toast"
import getFormQuestionsWOPaginationWOAbility from "src/form-questions/queries/getJobApplicationFormQuestions"
import MultiStepForm from "src/core/components/MultiStepForm"
import { FormStep, PlanName } from "types"
import { z } from "zod"
import { ArrowSmDownIcon } from "@heroicons/react/outline"
import { useForm, useFormContext } from "react-hook-form"
import getCategoriesWOPaginationWOAbility from "src/categories/queries/getCategoriesWOPaginationWOAbility"
import getSalaryIntervalFromSalaryType from "../utils/getSalaryIntervalFromSalaryType"
import Form from "src/core/components/Form"
import LabeledQuillEditor from "src/core/components/LabeledQuillEditor"
import UpgradeMessage from "src/plans/components/UpgradeMessage"
import { useRouter } from "next/router"

type JobDescriptionFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  jobId?: string // Need to be provided while editing the form
  companyId: string
  activePlanName: PlanName
}
export const JobDescriptionForm = (props: JobDescriptionFormProps) => {
  return (
    <Suspense fallback="Loading...">
      <Form
        header={props.header}
        subHeader={props.subHeader}
        submitText="Save"
        schema={z.object({
          description: z.string().optional(),
        })}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        // isSubmitTop={true}
        noPadding={true}
        unsavedChangesWarning={true}
      >
        <div className="flex flex-col space-y-6 w-full items-center">
          <div className="w-full">
            <LabeledQuillEditor name="description" placeholder="Enter job description..." />
            {/* <LabeledRichTextField
              name="description"
              label="Description"
              placeholder="Description"
              testid="jobDescription"
            /> */}
          </div>
        </div>
      </Form>
    </Suspense>
  )
}

export default JobDescriptionForm
