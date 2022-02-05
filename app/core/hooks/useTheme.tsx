import { createContext, useContext, useState, useEffect } from "react"

export const THEME_CONTEXT_DEFAULT = {
  theme: "pink",
  setTheme: (() => null) as any,
}

export const ThemeContext = createContext(THEME_CONTEXT_DEFAULT)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeContext used outside ThemeContext provider")
  }
  useEffect(() => {
    document.body.classList.value = "transition-colors ease-in-out duration-200"
    document.body.classList.add(`theme-${context.theme}`)
  }, [context.theme])

  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("pink")

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
