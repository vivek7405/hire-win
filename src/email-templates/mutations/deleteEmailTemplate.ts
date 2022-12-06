import { resolver } from "@blitzjs/rpc";
import db from "db"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.string()),
  resolver.authorize(),
  async (emailTemplateId, ctx) => {
    const emailTemplate = await db.emailTemplate.delete({
      where: { id: emailTemplateId },
    })

    return emailTemplate
  }
)
