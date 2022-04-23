import { enhancePrisma } from "blitz"
import { PrismaClient } from ".prisma2/client"

const EnhancedPrisma = enhancePrisma(PrismaClient)

export * from ".prisma2/client"
export default new EnhancedPrisma()
