import React, { Component, ErrorInfo } from "react"
import { AlertTriangle, WifiOff, ServerCrash } from "lucide-react"
import symbolLogo from "../../imports/symbol_only.jpeg"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  errorType: "network" | "500" | "generic" | null
  errorMsg: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorType: null, errorMsg: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    // Determine the type of error
    let errorType: "network" | "500" | "generic" = "generic"
    if (!navigator.onLine || error.message.toLowerCase().includes("network")) {
      errorType = "network"
    } else if (error.message.includes("500") || error.message.includes("501")) {
      errorType = "500"
    }
    return { hasError: true, errorType, errorMsg: error.message }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const { errorType } = this.state

      let icon = <AlertTriangle size={64} className="text-red-500 mb-4 mx-auto" />
      let title = "Something went wrong"
      let description = "We encountered an unexpected error."

      if (errorType === "network") {
        icon = <WifiOff size={64} className="text-[var(--warning)] mb-4 mx-auto" />
        title = "Network Connection Lost"
        description = "Please check your internet connection and try again."
      } else if (errorType === "500") {
        icon = <ServerCrash size={64} className="text-red-500 mb-4 mx-auto" />
        title = "Server Error (500/501)"
        description = "Our servers are currently facing an issue. Please try again later."
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4">
          <div className="text-center max-w-md bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-card)]">
            <img src={symbolLogo} alt="HireHub Symbol" className="w-16 h-16 mx-auto mb-6 object-contain rounded-full border border-[var(--border)]" />
            {icon}
            <h1 className="font-poppins text-2xl font-bold text-[var(--foreground)] mb-2">
              {title}
            </h1>
            <p className="text-[var(--muted-foreground)] mb-6">
              {description}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
