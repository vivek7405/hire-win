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
import LoginForm from "app/auth/components/LoginForm"
import { Suspense } from "react"
import { Toaster } from "react-hot-toast"
import ProgressBar from "@badrap/bar-of-progress"
import "app/core/styles/index.css"
import { IdProvider } from "@radix-ui/react-id"

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
    return <LoginForm onSuccess={resetErrorBoundary} />
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
