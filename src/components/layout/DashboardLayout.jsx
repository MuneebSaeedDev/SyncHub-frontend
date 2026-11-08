import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Logout from '../../features/auth/logout.jsx'
import { getUserInitials } from '../../utils/userUtils'
import { fetchTasks } from '../../store/taskSlice.js'
import { fetchFriends, fetchFriendRequests } from '../../store/friendSlice.js'

export default function DashboardLayout() {
    const dispatch = useDispatch()
    const [showLogout, setShowLogout] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const navigate = useNavigate()
    const location = useLocation()

    const { user } = useSelector((state) => state.auth)

    const userName = user?.name || 'User'
    const userInitials = getUserInitials(userName) || 'U'

    // Fetch tasks, friends, and friend requests globally for real-time sidebar badges
    useEffect(() => {
        dispatch(fetchTasks())
        dispatch(fetchFriends())
        dispatch(fetchFriendRequests())
    }, [dispatch])

    // Current URL determines the active sidebar item
    const getActiveItem = (pathname) => {
        if (pathname === '/dashboard') return 'Overview'
        if (pathname.startsWith('/tasks')) return 'My Tasks'
        if (pathname.startsWith('/friends')) return 'Friends'
        if (pathname.startsWith('/friend-requests')) return 'Friend Requests'
        if (pathname.startsWith('/settings')) return 'Settings'
        return 'Overview'
    }

    const activeItem = getActiveItem(location.pathname)

    // Sidebar navigation
    const handleNavigate = (name) => {
        const routes = {
            'Overview': '/dashboard',
            'My Tasks': '/tasks',
            'Friends': '/friends',
            'Friend Requests': '/friend-requests',
            'Settings': '/settings',
        }

        const path = routes[name]

        if (path) {
            navigate(path)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#ffffff] text-[#181d26]">

            <Sidebar
                activeItem={activeItem}
                onNavigate={handleNavigate}
                onLogout={() => setShowLogout(true)}
                user={user}
                userInitial={userInitials}
            />

            <main className="flex min-w-0 flex-1 flex-col bg-white">

                <Header
                    title={activeItem}
                    searchValue={searchQuery}
                    onSearch={setSearchQuery}
                    onNotifications={() => console.log('Notifications')}
                    onProfileClick={() => console.log('Profile')}
                    userInitial={userInitials}
                />

                <div className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </div>

            </main>

            <Logout
                open={showLogout}
                onClose={() => setShowLogout(false)}
            />

        </div>
    )
}
