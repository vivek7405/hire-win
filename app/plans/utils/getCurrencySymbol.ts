import { Currency } from "types"

const getCurrencySymbol = (currency: Currency) => {
  switch (currency) {
    case Currency.INR:
      return "₹"
    case Currency.USD:
      return "$"
    case Currency.CAD:
      return "$"
    case Currency.AUD:
      return "$"
    case Currency.GBP:
      return "£"
    case Currency.EUR:
      return "€"
    case Currency.AED:
      return "د.إ"
    default:
      return "$"
  }
}

export default getCurrencySymbol
