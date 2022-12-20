import { Ctx } from "@blitzjs/next"
import db, { CompanyUserRole } from "db"
import { PlanName } from "types"

const getCurrentCompanyOwnerActivePlan = async ({}, ctx: Ctx) => {
  const currentCompany = await db.company.findFirst({
    where: { id: ctx.session.companyId || "0" },
    include: { users: true },
  })

  const currentCompanyOwner = currentCompany?.users?.find(
    (user) => user.role === CompanyUserRole.OWNER
  )

  if (currentCompanyOwner) {
    const coupons = await db.coupon.findMany({
      where: { redeemedByUserId: currentCompanyOwner.id || "0" },
      orderBy: { licenseTier: "desc" },
    })

    if (coupons && coupons.length > 0) {
      // Consider the most recently redeemed highest tier coupon
      coupons.sort((c1, c2) => {
        let diff = c1.licenseTier - c2.licenseTier

        if (diff === 0) {
          diff = (c1.redemptionDate?.getTime() || 0) - (c2.redemptionDate?.getTime() || 0)
        }

        return diff
      })

      const couponToConsider = coupons[0]

      switch (couponToConsider?.licenseTier) {
        case 1:
          return PlanName.LIFETIMET1
        default:
          return PlanName.LIFETIMET1
      }
    }
  }

  return PlanName.FREE
}

export default getCurrentCompanyOwnerActivePlan
