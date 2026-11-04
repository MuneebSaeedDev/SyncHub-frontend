import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'

import Sidebar from '../../components/layout/Sidebar.jsx'
import Header from '../../components/layout/Header.jsx'
import Logout from '../../features/auth/logout.jsx'
import { getUserInitials } from '../../utils/userUtils'

export default function DashboardLayout() {
    const [showLogout, setShowLogout] = useState(false)
    const [activeItem, setActiveItem] = useState('Overview')
    const [searchQuery, setSearchQuery] = useState('')

    // Redux state for user info
    const { user } = useSelector((state) => state.auth)
    const userName = user?.name || 'User'
    const userInitials = getUserInitials(userName) || 'U'

    return (
        <div className="flex min-h-screen bg-slate-50/40 text-slate-800">
            {/* Sidebar */}
            <Sidebar
                activeItem={activeItem}
                onNavigate={setActiveItem}
                onLogout={() => setShowLogout(true)}
                user={user}
            />

            <main className="flex min-w-0 flex-1 flex-col bg-red">
                {/* Header */}
                <Header
                    title={activeItem}
                    searchValue={searchQuery}
                    onSearch={setSearchQuery}
                    onNotifications={() => console.log('Notifications')}
                    onProfileClick={() => console.log('Profile')}
                    userInitial={userInitials}
                />

                {/* Outlet renders DashboardPage or TaskPage dynamically */}
                <div className="flex-1 p-5">
                    <Outlet />
                </div>
            </main>

            {/* Logout Modal */}
            <Logout
                open={showLogout}
                onClose={() => setShowLogout(false)}
            />
        </div>
    )
}