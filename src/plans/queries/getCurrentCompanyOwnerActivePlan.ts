import { Ctx } from "@blitzjs/next"
import db, { CompanyUserRole, CouponSet } from "db"
import { checkSubscription } from "src/companies/utils/checkSubscription"
import { PlanName } from "types"

const getCurrentCompanyOwnerActivePlan = async ({}, ctx: Ctx) => {
  const currentCompany = await db.company.findFirst({
    where: { id: ctx.session.companyId || "0" },
    include: { users: { include: { user: true } } },
  })

  const currentCompanyOwner = currentCompany?.users?.find(
    (user) => user.role === CompanyUserRole.OWNER
  )

  if (currentCompanyOwner) {
    if (checkSubscription(currentCompanyOwner.user)) {
      return PlanName.RECRUITER
    }

    const coupons = await db.coupon.findMany({
      where: { redeemedByUserId: currentCompanyOwner.userId },
      orderBy: { redemptionDate: "desc" },
    })

    if (coupons && coupons.length > 0) {
      const couponToConsider = coupons[0]

      switch (couponToConsider?.couponSet) {
        case CouponSet.SET_1:
          return PlanName.LIFETIME_SET1
        default:
          return PlanName.LIFETIME_SET1
      }
    }
  }

  return PlanName.FREE
}

export default getCurrentCompanyOwnerActivePlan
