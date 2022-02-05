import { useMutation, useRouter } from "blitz"
import { loadStripe } from "@stripe/stripe-js"
import createStripeCheckoutSession from "app/jobs/mutations/createStripeCheckoutSession"
import updateStripeSubscription from "app/jobs/mutations/updateStripeSubscription"
import { Plan } from "types"
import { toast } from "react-hot-toast"

export default function SubscribeButton({
  jobId,
  plan,
  quantity,
  type,
  testid,
}: {
  jobId: string
  plan: Plan
  quantity: number
  type: "new" | "update"
  testid?: string
}) {
  const [createStripeSessionMutation] = useMutation(createStripeCheckoutSession)
  const [updateStripeSubscriptionMutation] = useMutation(updateStripeSubscription)
  const router = useRouter()

  const createSubscription = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC!)
    const sessionId = await createStripeSessionMutation({ plan, jobId, quantity })

    stripe?.redirectToCheckout({
      sessionId: sessionId,
    })
  }

  const updateSubscription = async () => {
    const toastId = toast.loading(() => <span>Upgrading Subscription</span>)
    try {
      await updateStripeSubscriptionMutation({ plan, jobId })
      toast.success(() => <span>Subscription Updated</span>, { id: toastId })
      router.reload()
    } catch (error) {
      toast.error("Sorry, we had an unexpected error. Please try again. - " + error.toString())
    }
  }

  return (
    <button
      className="text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700"
      data-testid={`${testid && `${testid}-`}upgradeButton`}
      onClick={(e) => {
        e.preventDefault()
        return type === "new" ? createSubscription() : updateSubscription()
      }}
    >
      {type === "new" ? "Subscribe" : "Upgrade"}
    </button>
  )
}
