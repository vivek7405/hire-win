import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.string()),
  resolver.authorize(),
  async (emailId, ctx) => {
    const email = await db.email.delete({
      where: { id: emailId },
    })

    return email
  }
)
