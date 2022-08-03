import {
  AppProps,
  ErrorComponent,
  useRouter,
  AuthenticationError,
  AuthorizationError,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
  Router,
} from "blitz"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import ProgressBar from "@badrap/bar-of-progress"
import "app/core/styles/index.css"
import "react-phone-number-input/style.css"
import "react-nice-dates/build/style.css"
import "app/core/styles/custom.css"
import "intro.js/introjs.css"
import { IdProvider } from "@radix-ui/react-id"
import LoginPage from "app/auth/pages/login"

const progress = new ProgressBar({
  size: 2,
  color: "#10B981",
  className: "bar-of-progress",
  delay: 100,
})

Router.events.on("routeChangeStart", progress.start)
Router.events.on("routeChangeComplete", progress.finish)
Router.events.on("routeChangeError", progress.finish)

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const handleRouteChange = (url) => {
    ;(window as any).gtag("config", "G-W4VZMRWMTR", {
      page_path: url,
    })
  }

  useEffect(() => {
    router.events.on("routeChangeComplete", handleRouteChange)
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [router.events])

  return (
    <Suspense fallback="Loading...">
      <ErrorBoundary
        FallbackComponent={RootErrorFallback}
        resetKeys={[router.asPath]}
        onReset={useQueryErrorResetBoundary().reset}
      >
        <IdProvider>
          <Component {...pageProps} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 5000,
            }}
          />
        </IdProvider>
      </ErrorBoundary>
    </Suspense>
  )
}

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    // return <LoginForm onSuccess={resetErrorBoundary} />
    return <LoginPage />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
    )
  }
}
