import { Currency } from "types"
import aedPlans from "./aedPlans"
import audPlans from "./audPlans"
import cadPlans from "./cadPlans"
import eurPlans from "./eurPlans"
import gbpPlans from "./gbpPlans"
import inrPlans from "./inrPlans"
import usdPlans from "./usdPlans"

type GetPlansInputType = {
  currency: Currency
}
const getPlansByCurrency = ({ currency }: GetPlansInputType) => {
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
      return inrPlans
  }
}

export default getPlansByCurrency
