import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { useQuery } from "blitz"
import getCategoriesWOPagination from "app/categories/queries/getCategoriesWOPagination"
import { Category, Workflow, Form, SalaryType, EmploymentType } from "@prisma/client"
import getWorkflowsWOPagination from "app/workflows/queries/getWorkflowsWOPagination"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import getFormsWOPagination from "app/forms/queries/getFormsWOPagination"
import { useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "app/core/components/CheckboxField"
import { titleCase } from "app/core/utils/titleCase"
import LabeledTextValidatedField from "app/core/components/LabeledTextValidatedField"
import ApplicationForm from "./ApplicationForm"
import toast from "react-hot-toast"
import getFormQuestionsWOPagination from "app/forms/queries/getFormQuestionsWOPagination"
import MultiStepForm from "app/core/components/MultiStepForm"
import { FormStep } from "types"

const Step1 = () => {
  return (
    <>
      <div className="w-full">
        <LabeledTextField
          type="text"
          name="title"
          label="Title"
          placeholder="Job Title"
          testid="jobTitle"
        />
      </div>

      <CheckboxField name="remote" label="Remote Job" testid="jobRemote" />

      <LabeledRichTextField
        name="description"
        label="Description"
        placeholder="Description"
        testid="jobDescription"
      />
    </>
  )
}

type Step2Props = {
  category?: Category // Need to be provided while editing the form
  user: any
}
const Step2 = (props: Step2Props) => {
  const [categories] = useQuery(getCategoriesWOPagination, { where: { userId: props.user?.id } })

  return (
    <>
      <div className="flex flex-col space-y-6 w-full items-center">
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="categoryId"
            label="Category"
            placeholder="Job Category"
            testid="jobCategory"
            disabled={props.category && !categories.find((c) => c.id === props.category?.id)}
            // defaultValue={props.initialValues?.categoryId}
            options={
              !props.category || categories.find((c) => c.id === props.category?.id)
                ? [
                    // { label: "Default", value: "" },
                    ...categories.map((c) => {
                      return { label: c.name!, value: c.id! }
                    }),
                  ]
                : [{ label: props.category?.name!, value: props.category?.id! }]
            }
          />
        </div>
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="employmentType"
            label="Employment Type"
            placeholder="Full Time, Part Time, etc."
            testid="employmentType"
            isMulti={true}
            options={Object.keys(EmploymentType).map((employmentType) => {
              return {
                label: titleCase(employmentType.replaceAll("_", " ")),
                value: employmentType,
              }
            })}
          />
        </div>
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledTextValidatedField
            type="date"
            name="validThrough"
            label="Valid Through"
            testid="jobValidThrough"
          />
        </div>
      </div>
    </>
  )
}

type Step3Props = {
  initialValues?: any
}
const Step3 = (props: Step3Props) => {
  const [countryCode, setCountryCode] = useState(props.initialValues.country || "")
  const [stateCode, setStateCode] = useState(props.initialValues.state || "")

  return (
    <>
      <div className="flex flex-col space-y-6 w-full items-center">
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="country"
            label="Country"
            placeholder="Country where you are offering the job"
            testid="jobCountry"
            options={[
              ...Country.getAllCountries().map((c) => {
                return { label: c.name, value: c.isoCode }
              }),
            ]}
            onChange={(val: any) => {
              setCountryCode(val)
            }}
          />
        </div>

        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="state"
            label="State"
            placeholder="State where you are offering the job"
            testid="jobState"
            disabled={countryCode === ""}
            options={[
              ...State.getStatesOfCountry(countryCode).map((s) => {
                return { label: s.name, value: s.isoCode }
              }),
            ]}
            onChange={(val: any) => {
              setStateCode(val)
            }}
          />
        </div>

        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="city"
            label="City"
            placeholder="City where you are offering the job"
            testid="jobCity"
            disabled={stateCode === ""}
            options={[
              ...City.getCitiesOfState(countryCode, stateCode).map((c) => {
                return { label: c.name, value: c.name }
              }),
            ]}
            onChange={(val: any) => {
              setStateCode(val)
            }}
          />
        </div>
      </div>
    </>
  )
}

const Step4 = () => {
  return (
    <>
      <div className="flex flex-col space-y-6 w-full items-center">
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="currency"
            label="Currency"
            placeholder="Currency for salary"
            testid="jobCurrency"
            options={[
              ...Country.getAllCountries().map((c) => {
                return { label: c.currency, value: c.currency }
              }),
            ]}
          />
        </div>

        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledTextValidatedField
            type="number"
            min="0"
            name="minSalary"
            label="Minimum Salary"
            placeholder="Minimum salary for this job"
            testid="jobMinSalary"
          />
        </div>

        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledTextValidatedField
            type="number"
            min="0"
            name="maxSalary"
            label="Maximum Salary"
            placeholder="Maximum salary for this job"
            testid="jobMaxSalary"
          />
        </div>

        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="salaryType"
            label="Salary Type"
            placeholder="Hourly, Weekly, etc."
            testid="salaryType"
            defaultValue={Object.keys(SalaryType).find((type) => type === SalaryType.YEAR)}
            options={Object.keys(SalaryType).map((salaryType) => {
              let type = ""
              switch (salaryType) {
                case SalaryType.HOUR:
                  type = "Hourly"
                  break
                case SalaryType.DAY:
                  type = "Daily"
                  break
                case SalaryType.WEEK:
                  type = "Weekly"
                  break
                case SalaryType.MONTH:
                  type = "Monthly"
                  break
                case SalaryType.YEAR:
                  type = "Yearly"
                  break
                default:
                  type = "Hourly"
                  break
              }
              return { label: type, value: salaryType }
            })}
          />
        </div>
      </div>
    </>
  )
}

type Step5Props = {
  workflow?: Workflow // Need to be provided while editing the form
  user: any
}
const Step5 = (props: Step5Props) => {
  const [workflows] = useQuery(getWorkflowsWOPagination, { where: { userId: props.user.id } })
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(
    workflows.find((w) => w.name === "Default")?.id
  )

  return (
    <>
      <div className="flex flex-col space-y-6 w-full items-center">
        <div className="w-full md:w-1/3 lg:w-1/3">
          <LabeledReactSelectField
            name="workflowId"
            // label="Interview Workflow"
            placeholder="Interview Workflow"
            testid="jobWorkflow"
            disabled={props.workflow && !workflows.find((w) => w.id === props.workflow?.id)}
            options={
              !props.workflow || workflows.find((w) => w.id === props.workflow?.id)
                ? [
                    // { label: "Default", value: "" },
                    ...workflows.map((w) => {
                      return { label: w.name!, value: w.id! }
                    }),
                  ]
                : [{ label: props.workflow?.name!, value: props.workflow?.id! }]
            }
            defaultValue={selectedWorkflowId}
            onChange={(value) => {
              setSelectedWorkflowId(value as any)
            }}
          />
        </div>
        <div className="w-full flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-2 lg:space-y-0 lg:space-x-2">
          {workflows
            .find((w) => w.id === selectedWorkflowId)
            ?.stages?.sort((a, b) => {
              return a.order - b.order
            })
            .map((ws) => {
              return (
                <div
                  key={ws.id}
                  className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center"
                >
                  <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
                    {ws.stage?.name}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </>
  )
}

type Step6Props = {
  initialValues?: any
  user: any
  category?: Category // Need to be provided while editing the form
  workflow?: Workflow // Need to be provided while editing the form
  form?: Form // Need to be provided while editing the form
}
const Step6 = (props: Step6Props) => {
  const [forms] = useQuery(getFormsWOPagination, { where: { userId: props.user?.id } })
  const [selectedFormId, setSelectedFormId] = useState(forms.find((f) => f.name === "Default")?.id)
  const [formQuestions] = useQuery(getFormQuestionsWOPagination, {
    where: { formId: selectedFormId! },
    orderBy: { order: "asc" },
  })

  return (
    <div>
      <div className="flex flex-col space-y-6 w-full items-center">
        <div className="w-full md:w-1/3 lg:w-1/3">
          <div className="invisible w-0 h-0 overflow-hidden">
            <Step1 />
            <Step2 user={props.user} category={props.category} />
            <Step3 initialValues={props.initialValues} />
            <Step4 />
            <Step5 user={props.user} workflow={props.workflow} />
          </div>
          <LabeledReactSelectField
            name="formId"
            // label="Application Form"
            placeholder="Job Application Form"
            testid="jobForm"
            disabled={props.form && !forms.find((f) => f.id === props.form?.id)}
            options={
              !props.form || forms.find((f) => f.id === props.form?.id)
                ? [
                    ...forms.map((f) => {
                      return { label: f.name!, value: f.id! }
                    }),
                  ]
                : [{ label: props.form?.name!, value: props.form?.id! }]
            }
            defaultValue={selectedFormId}
            onChange={(value) => {
              setSelectedFormId(value as any)
            }}
          />
        </div>
        <div className="w-full md:w-1/3 lg:w-1/3 bg-white min-h-screen max-h-screen border-8 border-neutral-300 rounded-3xl relative top-0">
          <div className="w-full h-full overflow-auto rounded-3xl">
            <ApplicationForm
              header="Job Application Form"
              subHeader="Preview"
              formId={selectedFormId!}
              preview={true}
              onSubmit={async (values) => {
                toast.error("Can't submit the form in preview mode")
              }}
              submitDisabled={true}
              formQuestions={formQuestions}
            />
          </div>
          <div className="bg-neutral-300 rounded-2xl h-1 w-1/2 absolute left-1/4 bottom-2" />
        </div>
      </div>
    </div>
  )
}

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  workflow?: Workflow // Need to be provided while editing the form
  form?: Form // Need to be provided while editing the form
}
export const JobForm = (props: JobFormProps) => {
  const stp1: FormStep = { name: "Basic", renderComponent: <Step1 /> }
  const stp2: FormStep = {
    name: "Extra",
    renderComponent: <Step2 user={props.user} category={props.category} />,
  }
  const stp3: FormStep = {
    name: "Location",
    renderComponent: <Step3 initialValues={props.initialValues} />,
  }
  const stp4: FormStep = { name: "Salary", renderComponent: <Step4 /> }
  const stp5: FormStep = {
    name: "Workflow",
    renderComponent: <Step5 user={props.user} workflow={props.workflow} />,
  }
  const stp6: FormStep = {
    name: "Form",
    renderComponent: (
      <Step6
        initialValues={props.initialValues}
        user={props.user}
        category={props.category}
        workflow={props.workflow}
        form={props.form}
      />
    ),
  }
  const steps = [stp1, stp2, stp3, stp4, stp5, stp6]

  return (
    <MultiStepForm
      steps={steps}
      initialValues={props.initialValues}
      onSubmit={props.onSubmit}
      schema={Job}
      header={props.header}
      subHeader={props.subHeader}
    />
  )
}

export default JobForm
