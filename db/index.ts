import { enhancePrisma } from "blitz"
import { PrismaClient } from ".prisma1/client"

const EnhancedPrisma = enhancePrisma(PrismaClient)

export * from ".prisma1/client"
export default new EnhancedPrisma()
