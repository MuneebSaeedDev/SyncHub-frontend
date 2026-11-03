import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../features/auth/Login'
import Signup from '../features/auth/signup'
// check the authentication is true (dashboard) public then if false (login) protected
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

import DashboardPage from '../pages/dashboard/DashboardPage'

export default function AppRoutes() {
    return (
        <Routes>

            {/* Public routes */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            {/* 404 */}
            <Route
                path="*"
                element={<h1 className="p-10 text-center">404 - Page Not Found</h1>}
            />

        </Routes>
    )
}