import { SalaryType } from "@prisma/client"

const getSalaryIntervalFromSalaryType = (salaryType) => {
  let type = ""
  switch (salaryType) {
    case SalaryType.HOUR:
      type = "Hourly"
      break
    case SalaryType.DAY:
      type = "Daily"
      break
    case SalaryType.WEEK:
      type = "Weekly"
      break
    case SalaryType.MONTH:
      type = "Monthly"
      break
    case SalaryType.YEAR:
      type = "Yearly"
      break
    default:
      type = "Hourly"
      break
  }
  return type
}

export default getSalaryIntervalFromSalaryType
