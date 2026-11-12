import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import type { UserRole } from "../../types"

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: UserRole
}

export default function ProtectedRoute({
  children,
  role,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, checkSessionValidity, logout } = useAuthStore()
  const isValid = isAuthenticated && checkSessionValidity()

  useEffect(() => {
    if (isAuthenticated && !isValid) {
      logout()
    }
  }, [isAuthenticated, isValid, logout])

  if (!isValid) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role) {
    const fallbackTarget =
      user?.role === "admin"
        ? "/admin"
        : user?.role === "recruiter"
          ? "/recruiter"
          : "/dashboard"
    return <Navigate to={fallbackTarget} replace />
  }

  return <>{children}</>
}
