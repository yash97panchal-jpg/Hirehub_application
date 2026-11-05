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
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
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
