import colors from "tailwindcss/colors"

export function getTailwindColors(onlyThemeColors = false) {
  const tailwindcolors = {}

  for (let colorsKey in colors) {
    if (typeof colors[colorsKey] === "string" && colors[colorsKey].includes("#")) {
      if (!onlyThemeColors) {
        tailwindcolors[colorsKey] = colors[colorsKey]
      }
    } else {
      for (let nestedKey in colors[colorsKey]) {
        if (
          typeof colors[colorsKey][nestedKey] === "string" &&
          colors[colorsKey][nestedKey].includes("#")
        ) {
          if (onlyThemeColors) {
            // Only colors with weight 600
            if (parseInt(nestedKey, 10) === 600) {
              // Convert to pascal case and then add a space between pascal case words
              const pascalCaseWithSpace = (colorsKey.charAt(0).toUpperCase() + colorsKey.slice(1))
                .replace(/([A-Z])/g, " $1")
                .trim()
              // Return only the colors with single word
              if (pascalCaseWithSpace.split(" ")?.length === 1) {
                tailwindcolors[`${colorsKey}-${nestedKey}`] = colors[colorsKey][nestedKey]
              }
            }
          } else {
            tailwindcolors[`${colorsKey}-${nestedKey}`] = colors[colorsKey][nestedKey]
          }
        }
      }
    }
  }

  return tailwindcolors
}

export function getColorValueFromTheme(theme) {
  const tailwindColors = getTailwindColors(true)
  const [key, value]: any = Object.entries(tailwindColors).find(([key, value]) =>
    key.includes(theme)
  )
  return value
}

export function getThemeFromColorValue(colorValue) {
  const tailwindColors = getTailwindColors(true)
  const [key, value]: any = Object.entries(tailwindColors).find(
    ([key, value]) => value === colorValue
  )
  return key.replace("-600", "")
}
