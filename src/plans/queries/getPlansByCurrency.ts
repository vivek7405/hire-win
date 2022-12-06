import { Currency } from "types"
import aedPlans from "../utils/aedPlans"
import audPlans from "../utils/audPlans"
import cadPlans from "../utils/cadPlans"
import eurPlans from "../utils/eurPlans"
import gbpPlans from "../utils/gbpPlans"
import inrPlans from "../utils/inrPlans"
import usdPlans from "../utils/usdPlans"

type GetPlansInputType = {
  currency: Currency
}
const getPlansByCurrency = async ({ currency }: GetPlansInputType) => {
  switch (currency) {
    case Currency.INR:
      return inrPlans
    case Currency.USD:
      return usdPlans
    case Currency.CAD:
      return cadPlans
    case Currency.AUD:
      return audPlans
    case Currency.GBP:
      return gbpPlans
    case Currency.EUR:
      return eurPlans
    case Currency.AED:
      return aedPlans
    default:
      return usdPlans
  }
}

export default getPlansByCurrency
