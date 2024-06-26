import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { Login } from "../validations"
import { UserRole } from "@prisma/client"
import { AuthenticationError } from "blitz"

export const authenticateUser = async (rawEmail: string, rawPassword: string) => {
  const email = rawEmail.toLowerCase().trim()
  const password = rawPassword.trim()
  const user = await db.user.findFirst({
    where: { email },
    include: { companies: { orderBy: { createdAt: "asc" } } },
  })
  if (!user) throw new AuthenticationError()

  const result = await SecurePassword.verify(user.hashedPassword, password)

  if (result === SecurePassword.VALID_NEEDS_REHASH) {
    // Upgrade hashed password with a more secure hash
    const improvedHash = await SecurePassword.hash(password)
    await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } })
  }

  const { hashedPassword, ...rest } = user
  return rest
}

export default resolver.pipe(resolver.zod(Login), async ({ email, password }, ctx) => {
  // This throws an error if credentials are invalid
  const user = await authenticateUser(email, password)
  const companyUsers = user.companies
  const companyId = (companyUsers && (companyUsers[0]?.companyId || "0")) || "0"
  await ctx.session.$create({
    userId: user.id,
    role: user.role as UserRole,
    companyId,
  })
  return companyId
})
