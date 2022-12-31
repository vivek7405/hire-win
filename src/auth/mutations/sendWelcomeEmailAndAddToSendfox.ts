import { Ctx } from "blitz"
import axios from "axios"
import { welcomeToHireWinMailer } from "mailers/welcomeToHireWinMailer"

type SendWelcomeEmailAndAddToSendfoxInput = {
  name: string
  email: string
  companySlug: string
}
export default async function sendWelcomeEmailAndAddToSendfox(
  { name, email, companySlug }: SendWelcomeEmailAndAddToSendfoxInput,
  ctx: Ctx
) {
  // Send welcome email to user
  try {
    const buildEmail = await welcomeToHireWinMailer({
      toEmail: email,
      toName: name,
      companySlug,
    })
    await buildEmail.send()
  } catch {}

  // Add contact to sendfox email list if on production
  try {
    if (process.env.NODE_ENV === "production") {
      const sendfoxApiToken = process.env.SENDFOX_API_TOKEN
      const sendfoxApplicationSignupsListId = process.env.SENDFOX_APPLICATION_SIGNUPS_LIST_ID
      if (sendfoxApiToken && sendfoxApplicationSignupsListId) {
        axios.post(
          "https://api.sendfox.com/contacts",
          {
            email,
            first_name: name,
            lists: [parseInt(sendfoxApplicationSignupsListId)],
          },
          {
            headers: { Authorization: `Bearer ${sendfoxApiToken}` },
          }
        )
      }
    }
  } catch {}
}
