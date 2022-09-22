import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Job } from "app/jobs/validations"
import LabeledRichTextField from "app/core/components/LabeledRichTextField"
import { useQuery } from "blitz"
import { Category, SalaryType, EmploymentType } from "@prisma/client"
import LabeledReactSelectField from "app/core/components/LabeledReactSelectField"
import { Suspense, useEffect, useState } from "react"
import { Country, State, City } from "country-state-city"
import CheckboxField from "app/core/components/CheckboxField"
import { titleCase } from "app/core/utils/titleCase"
import LabeledTextValidatedField from "app/core/components/LabeledTextValidatedField"
import ApplicationForm from "../../candidates/components/ApplicationForm"
import toast from "react-hot-toast"
import getFormQuestionsWOPaginationWOAbility from "app/form-questions/queries/getJobApplicationFormQuestions"
import MultiStepForm from "app/core/components/MultiStepForm"
import { FormStep } from "types"
import { z } from "zod"
import { ArrowSmDownIcon } from "@heroicons/react/outline"
import { useFormContext } from "react-hook-form"
import getCategoriesWOPaginationWOAbility from "app/categories/queries/getCategoriesWOPaginationWOAbility"
import getSalaryIntervalFromSalaryType from "../utils/getSalaryIntervalFromSalaryType"

const Step1Basic = () => {
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

      <CheckboxField name="postToGoogle" label="Post to Google Jobs" testid="postToGoogle" />
    </>
  )
}

type Step2ExtraProps = {
  category?: Category // Need to be provided while editing the form
  companyId: string
  // user: any
}
const Step2Extra = (props: Step2ExtraProps) => {
  const [categories] = useQuery(getCategoriesWOPaginationWOAbility, {
    where: { companyId: props.companyId },
  })

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
            defaultValue={[
              Object.keys(EmploymentType).find((employmentType) => employmentType === "FULL_TIME"),
            ]}
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

type Step3LocationProps = {
  initialValues?: any
}
const Step3Location = (props: Step3LocationProps) => {
  const [countryCode, setCountryCode] = useState(props.initialValues.country || "")
  const [stateCode, setStateCode] = useState(props.initialValues.state || "")
  const [city, setCity] = useState(props.initialValues.city || "")

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
              props.initialValues.country = val
            }}
            defaultValue={countryCode}
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
              props.initialValues.state = val
            }}
            defaultValue={stateCode}
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
              setCity(val)
              props.initialValues.city = val
            }}
            defaultValue={city}
          />
        </div>
      </div>
    </>
  )
}

const Step4Salary = () => {
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
              const type = getSalaryIntervalFromSalaryType(salaryType)
              return { label: type, value: salaryType }
            })}
          />
        </div>
      </div>
    </>
  )
}

// type Step5WorkflowProps = {
//   workflow?: ExtendedWorkflow // Need to be provided while editing the form
//   jobId?: string // Need to be provided while editing the form
//   companyId: string
//   // user: any
// }
// const Step5Workflow = (props: Step5WorkflowProps) => {
//   const { getValues, setValue, register } = useFormContext()

//   const [workflows] = useQuery(getWorkflowsWOPaginationWOAbility, {
//     where: { companyId: props.companyId },
//   })
//   const defaultWorkflow = workflows.find((w) => w.name === "Default")
//   const [selectedWorkflowId, setSelectedWorkflowId] = useState(
//     getValues("workflowId") || props.workflow?.id || defaultWorkflow?.id
//   )

//   const [scoreCards] = useQuery(getScoreCardsWOPaginationWOAbility, {
//     where: { companyId: props.companyId },
//   })
//   const defaultScoreCard = scoreCards.find((w) => w.name === "Default")

//   useEffect(() => {
//     const scoreCardsValue: ScoreCardJobWorkflowStageObjInputType[] =
//       workflows
//         .find((w) => w.id === selectedWorkflowId)
//         ?.stages?.map((ws) => {
//           const scoreCardJobWorkflowStage = ws?.scoreCards?.find(
//             (sc) => sc.workflowStageId === ws.id && sc.jobId === props.jobId
//           )
//           const currentScoreCardValueForWorkflowStage: ScoreCardJobWorkflowStageObjInputType =
//             getValues("scoreCards")?.find((value) => value?.workflowStageId === ws.id)

//           return {
//             id: scoreCardJobWorkflowStage?.id || "",
//             // scoreCardId will be auto set since it is registered as input name for LabeledReactSelectField
//             scoreCardId:
//               currentScoreCardValueForWorkflowStage?.scoreCardId ||
//               scoreCardJobWorkflowStage?.scoreCardId ||
//               defaultScoreCard?.id ||
//               "",
//             jobId: props.jobId || "",
//             workflowStageId: scoreCardJobWorkflowStage?.workflowStageId || ws.id || "",
//           }
//         }) || []
//     setValue("scoreCards", scoreCardsValue)
//   }, [selectedWorkflowId, workflows, setValue, getValues, defaultScoreCard, props.jobId])

//   return (
//     <>
//       <div className="flex flex-col space-y-6 w-full items-center">
//         <div className="w-full md:w-1/3 lg:w-1/3">
//           <LabeledReactSelectField
//             name="workflowId"
//             // label="Interview Workflow"
//             placeholder="Interview Workflow"
//             testid="jobWorkflow"
//             disabled={props.workflow && !workflows.find((w) => w.id === props.workflow?.id)}
//             options={
//               !props.workflow || workflows.find((w) => w.id === props.workflow?.id)
//                 ? [
//                     ...workflows.map((w) => {
//                       return { label: w.name!, value: w.id! }
//                     }),
//                   ]
//                 : [{ label: props.workflow?.name!, value: props.workflow?.id! }]
//             }
//             defaultValue={selectedWorkflowId}
//             value={selectedWorkflowId}
//             onChange={(selectedWorkflowId) => {
//               getValues("scoreCards")?.forEach((value) => {
//                 const selectedWorkflow = workflows.find(
//                   (w) => w.id === (selectedWorkflowId as any as string)
//                 )
//                 if (value?.workflowStageId) {
//                   const workflowStage = selectedWorkflow?.stages?.find(
//                     (ws) => ws.id == value?.workflowStageId
//                   )
//                   const scoreCardJobWorkflowStage = workflowStage?.scoreCards?.find(
//                     (sc) => sc.workflowStageId === workflowStage?.id && sc.jobId === props.jobId
//                   )
//                   value.scoreCardId = scoreCardJobWorkflowStage?.id
//                 }
//               })
//               setSelectedWorkflowId(selectedWorkflowId as any)
//             }}
//           />
//         </div>
//         <label className="font-medium text-xl text-neutral-600">Score Cards</label>
//         <div className="w-full flex flex-col md:flex-row lg:flex-row items-center justify-center space-y-20 md:space-y-0 lg:space-y-0 md:space-x-2 lg:space-x-2">
//           {workflows
//             .find((w) => w.id === selectedWorkflowId)
//             ?.stages?.sort((a, b) => {
//               return a.order - b.order
//             })
//             .map((ws, index) => {
//               const existingScoreCardJobWorkflowStage = ws.scoreCards?.find(
//                 (sc) => sc.workflowStageId === ws.id && sc.jobId === props.jobId
//               )
//               const existingScoreCard: ScoreCard | null | undefined = scoreCards.find(
//                 (sc) => sc.id === existingScoreCardJobWorkflowStage?.scoreCardId
//               )

//               return (
//                 <div key={ws.id}>
//                   <div className="overflow-auto p-1 rounded-lg border-2 border-neutral-300 bg-neutral-50 w-32 flex flex-col items-center justify-center">
//                     <div className="overflow-hidden text-sm text-neutral-500 font-semibold whitespace-nowrap w-full text-center">
//                       {ws.stage?.name}
//                     </div>
//                   </div>

//                   <div className="w-32 my-2 flex flex-col items-center justify-center">
//                     <ArrowSmDownIcon className="h-6 w-auto text-neutral-500" />
//                   </div>

//                   <div className="w-32">
//                     <LabeledReactSelectField
//                       name={`scoreCards.${index}.scoreCardId`}
//                       // {...register(`scoreCards.${index}.scoreCardId`)}
//                       placeholder={`Score Card for ${ws.stage?.name}`}
//                       testid={`scoreCard-${ws.id}`}
//                       disabled={existingScoreCardJobWorkflowStage && !existingScoreCard}
//                       options={
//                         !existingScoreCardJobWorkflowStage || existingScoreCard
//                           ? [
//                               ...scoreCards.map((sc) => {
//                                 return { label: sc.name!, value: sc.id! }
//                               }),
//                             ]
//                           : [
//                               {
//                                 label: (existingScoreCard as ScoreCard | null | undefined)?.name!,
//                                 value: (existingScoreCard as ScoreCard | null | undefined)?.id!,
//                               },
//                             ]
//                       }
//                       defaultValue={
//                         existingScoreCardJobWorkflowStage?.scoreCardId || defaultScoreCard?.id
//                       }
//                     />
//                   </div>
//                 </div>
//               )
//             })}
//         </div>
//       </div>
//     </>
//   )
// }

// type Step6FormProps = {
//   initialValues?: any
//   // user: any
//   category?: Category // Need to be provided while editing the form
//   // workflow?: ExtendedWorkflow // Need to be provided while editing the form
//   // form?: Form // Need to be provided while editing the form
//   jobId?: string // Need to be provided while editing the form
//   companyId: string
// }
// const Step6Form = (props: Step6FormProps) => {
//   const [forms] = useQuery(getFormsWOPaginationWOAbility, { where: { companyId: props.companyId } })
//   const [selectedFormId, setSelectedFormId] = useState(
//     props.form?.id || forms.find((f) => f.name === "Default")?.id
//   )
//   const [formQuestions] = useQuery(getFormQuestionsWOPaginationWOAbility, {
//     where: { formId: selectedFormId! },
//     orderBy: { order: "asc" },
//   })

//   return (
//     <div>
//       <div className="flex flex-col space-y-6 w-full items-center">
//         <div className="w-full md:w-1/2 lg:w-1/2">
//           <div className="invisible w-0 h-0 overflow-hidden">
//             <Step1Basic />
//             <Step2Extra companyId={props.companyId} category={props.category} />
//             <Step3Location initialValues={props.initialValues} />
//             <Step4Salary />
//             {/* <Step5Workflow
//               companyId={props.companyId}
//               workflow={props.workflow}
//               jobId={props.jobId}
//             /> */}
//           </div>
//           <LabeledReactSelectField
//             name="formId"
//             // label="Application Form"
//             placeholder="Job Application Form"
//             testid="jobForm"
//             disabled={props.form && !forms.find((f) => f.id === props.form?.id)}
//             options={
//               !props.form || forms.find((f) => f.id === props.form?.id)
//                 ? [
//                     ...forms.map((f) => {
//                       return { label: f.name!, value: f.id! }
//                     }),
//                   ]
//                 : [{ label: props.form?.name!, value: props.form?.id! }]
//             }
//             defaultValue={selectedFormId}
//             onChange={(value) => {
//               setSelectedFormId(value as any)
//             }}
//           />
//         </div>
//         <div className="w-full md:w-1/2 lg:w-1/2">
//           <div className="w-full bg-white max-h-screen overflow-auto border-8 shadow-md shadow-theme-400 border-theme-400 rounded-3xl relative top-0">
//             <div className="w-full h-full rounded-2xl">
//               <ApplicationForm
//                 header="Job Application Form (Preview)"
//                 subHeader="This is how the Application Form will look for this job"
//                 formId={selectedFormId!}
//                 preview={true}
//                 onSubmit={async (values) => {
//                   toast.error("Can't submit the form in preview mode")
//                 }}
//                 submitDisabled={true}
//                 formQuestions={formQuestions}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

type JobFormProps = {
  onSuccess?: () => void
  initialValues?: any
  onSubmit: any
  header: string
  subHeader: string
  user: any
  category?: Category // Need to be provided while editing the form
  // workflow?: ExtendedWorkflow // Need to be provided while editing the form
  // form?: Form // Need to be provided while editing the form
  jobId?: string // Need to be provided while editing the form
  companyId: string
}
export const JobForm = (props: JobFormProps) => {
  const stp1: FormStep = {
    name: "Basic",
    renderComponent: <Step1Basic />,
    validationSchema: z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      title: z.string().nonempty({ message: "Required" }),
      remote: z.boolean(),
      description: z.any(),
      postToGoogle: z.boolean(),
    }),
  }
  const stp2: FormStep = {
    name: "Extra",
    renderComponent: <Step2Extra companyId={props.companyId} category={props.category} />,
    validationSchema: z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      categoryId: z.string().optional(),
      employmentType: z.array(z.nativeEnum(EmploymentType)),
      validThrough: z.date(),
    }),
  }
  const stp3: FormStep = {
    name: "Location",
    renderComponent: <Step3Location initialValues={props.initialValues} />,
    validationSchema: z.object({
      id: z.string().optional(),
      slug: z.string().optional(),
      country: z.string(),
      state: z.string(),
      city: z.string(),
    }),
  }
  const stp4: FormStep = {
    name: "Salary",
    renderComponent: <Step4Salary />,
    validationSchema: Job,
    // validationSchema: z.object({
    //   id: z.string().optional(),
    //   slug: z.string().optional(),
    //   currency: z.string(),
    //   minSalary: z.number(),
    //   maxSalary: z.number(),
    //   salaryType: z.nativeEnum(SalaryType),
    // }),
  }
  // const stp5: FormStep = {
  //   name: "Workflow",
  //   renderComponent: (
  //     <Step5Workflow companyId={props.companyId} workflow={props.workflow} jobId={props.jobId} />
  //   ),
  //   validationSchema: z.object({
  //     id: z.string().optional(),
  //     slug: z.string().optional(),
  //     workflowId: z.string().optional(),
  //     scoreCards: z.array(ScoreCardJobWorkflowStageObj).optional(),
  //   }),
  // }
  // const stp6: FormStep = {
  //   name: "Form",
  //   renderComponent: (
  //     <Step6Form
  //       initialValues={props.initialValues}
  //       companyId={props.companyId}
  //       category={props.category}
  //       // workflow={props.workflow}
  //       form={props.form}
  //       jobId={props.jobId}
  //     />
  //   ),
  //   validationSchema: Job,
  // }
  const steps = [stp1, stp2, stp3, stp4]

  return (
    <Suspense fallback="Loading...">
      <MultiStepForm
        steps={steps}
        initialValues={props.initialValues}
        onSubmit={props.onSubmit}
        header={props.header}
        subHeader={props.subHeader}
      />
    </Suspense>
  )
}

export default JobForm
