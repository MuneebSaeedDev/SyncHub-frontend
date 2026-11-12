import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function PublicRoute() {
    const { isAuthenticated, isCheckingAuth } = useSelector(
        (state) => state.auth
    )

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="!text-sm !text-gray-500">
                    Checking authentication...
                </p>
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}