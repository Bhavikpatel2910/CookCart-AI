import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (event) => {
      event.preventDefault()
      console.error('CookCart UI error boundary:', event.error)
      setError(event.error)
      setHasError(true)
    }

    const handleRejection = (event) => {
      console.error('CookCart unhandled promise rejection:', event.reason)
      setError(event.reason)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  const resetError = () => {
    setHasError(false)
    setError(null)
  }

  if (hasError) {
    if (fallback) {
      return typeof fallback === 'function' ? fallback({ error, resetError }) : fallback
    }

    return (
      <main className="min-h-screen bg-background-alt px-4 flex items-center justify-center text-center">
        <section className="max-w-md rounded-3xl bg-surface-container-lowest p-8 shadow-card-soft">
          <p className="text-label-md text-success-veg font-semibold mb-2">COOKCART AI</p>
          <h1 className="font-display text-3xl font-bold text-on-surface mb-3">Something went wrong</h1>
          <p className="text-body-md text-on-surface-variant mb-6">
            Your cooking plan is safe. Return home and try the journey again.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={resetError}
              className="rounded-2xl bg-surface-container-low px-5 py-3 text-label-md font-semibold text-on-surface"
            >
              Try again
            </button>
            <Link to="/" className="rounded-2xl bg-success-veg px-5 py-3 text-label-md font-semibold text-white">
              Go to Home
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return children
}
