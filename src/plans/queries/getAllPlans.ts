import { Ctx } from "@blitzjs/next"
import allPlans from "../utils/allPlans"

const getAllPlans = async ({}, ctx: Ctx) => {
  return allPlans
}

export default getAllPlans
