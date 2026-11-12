import { Routes, Route, Navigate } from 'react-router-dom'

import Login from '../features/auth/Login'
import Signup from '../features/auth/signup'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

import DashboardLayout from '../components/layout/DashboardLayout' // Import layout
import DashboardPage from '../pages/dashboard/DashboardPage'
import TaskPage from '../pages/task/TaskPage'
import ViewTask from '../pages/task/ViewTask'
import SharedTasksPage from '../pages/sharedTask/SharedTasksPage'
import FriendsPage from '../pages/friends/friendsPage'
import FriendRequestsPage from '../pages/friends/FriendRequestsPage'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected Layout Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/tasks" element={<TaskPage />} />
                    <Route path="/tasks/:id" element={<ViewTask />} />
                    <Route path="/shared-tasks" element={<SharedTasksPage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/friend-requests" element={<FriendRequestsPage />} />
                </Route>
            </Route>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            {/* 404 */}
            <Route
                path="*"
                element={<h1 className="p-10 !text-center">404 - Page Not Found</h1>}
            />
        </Routes>
    )
}