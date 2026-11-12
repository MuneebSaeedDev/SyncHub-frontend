import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    LayoutDashboard,
    CheckSquare,
    Share2,
    Users,
    UserRoundPlus,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react'
import BrandLogo from '../common/BrandLogo'

export default function Sidebar({
    activeItem,
    onNavigate,
    onLogout,
    user,
    userInitial,
}) {
    const userName = user?.name || 'User'
    const userEmail = user?.email || ''
    const initials = userInitial || userName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')
    const [mobileOpen, setMobileOpen] = useState(false)

    // Real-time counts from Redux store
    const tasks = useSelector((state) => state.tasks?.tasks) || []
    const friends = useSelector((state) => state.friends?.list) || []
    const friendRequests = useSelector((state) => state.friends?.requests) || []
    const sharedReceived = useSelector((state) => state.sharedTasks?.received) || []

    const tasksCount = Array.isArray(tasks) ? tasks.length : 0
    const friendsCount = Array.isArray(friends) ? friends.length : 0
    const requestsCount = Array.isArray(friendRequests) ? friendRequests.length : 0
    const sharedCount = Array.isArray(sharedReceived) ? sharedReceived.length : 0

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'My Tasks', icon: CheckSquare, count: tasksCount },
        { name: 'Shared Tasks', icon: Share2, count: sharedCount },
        { name: 'Friends', icon: Users, count: friendsCount },
        { name: 'Friend Requests', icon: UserRoundPlus, count: requestsCount },
        { name: 'Settings', icon: Settings },
    ]

    const handleNavigate = (name) => {
        onNavigate?.(name)
        setMobileOpen(false)
    }

    return (
        <>
            {/* Mobile Toggle */}
            <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={mobileOpen}
                className="cursor-pointer fixed left-3 top-3 z-[1100] flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dddddd] bg-white !text-[#41454d] shadow-xs min-[701px]:hidden hover:!text-[#181d26]"
            >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-[1000] bg-[#181d26]/40 backdrop-blur-xs min-[701px]:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[1001]
                    flex h-dvh w-[240px] shrink-0 flex-col
                    border-r border-[#dddddd] bg-[#f8fafc]
                    transition-transform duration-200

                    min-[701px]:sticky min-[701px]:top-0
                    min-[701px]:h-screen min-[701px]:translate-x-0

                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo */}
                <div className="flex h-14 shrink-0 items-center px-4 border-b border-[#dddddd] bg-white">
                    <BrandLogo size="sm" />
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const active = activeItem === item.name

                        return (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => handleNavigate(item.name)}
                                aria-current={active ? 'page' : undefined}
                                className={`
                                    cursor-pointer flex h-9 w-full items-center gap-2.5
                                    rounded-[8px] px-2.5 !text-left !text-xs
                                    transition-colors

                                    ${active
                                        ? 'bg-[#181d26] !font-medium !text-white shadow-xs'
                                        : '!font-normal !text-[#41454d] hover:bg-[#e0e2e6]/60 hover:!text-[#181d26]'
                                    }
                                `}
                            >
                                <Icon
                                    size={16}
                                    strokeWidth={1.8}
                                    className={`shrink-0 ${active ? '!text-white' : '!text-[#41454d]'}`}
                                />

                                <span className="flex-1 !whitespace-nowrap !truncate">
                                    {item.name}
                                </span>

                                {item.count !== undefined && (
                                    <span
                                        className={`
                                            !text-[11px] !tabular-nums !font-medium px-1.5 py-0.5 rounded-[4px]
                                            ${active
                                                ? 'bg-white/20 !text-white'
                                                : item.name === 'Friend Requests' && item.count > 0
                                                    ? 'bg-[#aa2d00]/10 !text-[#aa2d00]'
                                                    : 'bg-[#e0e2e6] !text-[#41454d]'
                                            }
                                        `}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="mt-auto shrink-0 border-t border-[#dddddd] bg-white p-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#f8fafc] border border-[#dddddd] !text-xs !font-medium !text-[#181d26]">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="!truncate !text-xs !font-medium !text-[#181d26]">
                                {userName}
                            </h3>

                            <p className="!truncate !text-[11px] !text-[#41454d]">
                                {userEmail}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            title="Logout"
                            aria-label="Logout"
                            className="cursor-pointer flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] !text-[#41454d] transition hover:bg-[#f8fafc] hover:!text-[#aa2d00]"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
