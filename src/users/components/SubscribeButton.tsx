import { useSession } from "@blitzjs/auth";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import { loadStripe } from "@stripe/stripe-js"
import createStripeCheckoutSession from "src/companies/mutations/createStripeCheckoutSession"
import updateStripeSubscription from "src/companies/mutations/updateStripeSubscription"
import { Plan, PlanFrequency } from "types"
import { toast } from "react-hot-toast"

export default function SubscribeButton({
  userId,
  priceId,
  frequency,
  quantity,
  type,
  testid,
}: {
  userId: string
  priceId: string
  frequency: PlanFrequency
  quantity: number
  type: "new" | "update"
  testid?: string
}) {
  const [createStripeSessionMutation] = useMutation(createStripeCheckoutSession)
  const [updateStripeSubscriptionMutation] = useMutation(updateStripeSubscription)
  const router = useRouter()
  const session = useSession()

  const createSubscription = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC!)
    const sessionId = await createStripeSessionMutation({
      priceId,
      companyId: session?.companyId || "0",
      quantity,
    })

    sessionId &&
      stripe?.redirectToCheckout({
        sessionId: sessionId,
      })
  }

  const updateSubscription = async () => {
    const toastId = toast.loading(() => <span>Upgrading Subscription</span>)
    try {
      await updateStripeSubscriptionMutation({ priceId, companyId: session.companyId || "0" })
      toast.success(() => <span>Subscription Updated</span>, { id: toastId })
      router.reload()
    } catch (error) {
      toast.error("Sorry, we had an unexpected error. Please try again. - " + error.toString())
    }
  }

  return (
    <button
      className="text-white bg-theme-600 px-4 py-2 rounded hover:bg-theme-700 capitalize whitespace-nowrap"
      data-testid={`${testid && `${testid}-`}upgradeButton`}
      onClick={(e) => {
        e.preventDefault()
        return type === "new" ? createSubscription() : updateSubscription()
      }}
    >
      {type === "new" ? `Subscribe ${frequency?.toLowerCase()}` : "Upgrade"}
    </button>
  )
}