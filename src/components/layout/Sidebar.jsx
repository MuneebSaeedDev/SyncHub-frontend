import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    UserRoundPlus,
    Settings,
    LogOut,
    Menu,
    X,
    Network,
} from 'lucide-react'

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

    const tasksCount = Array.isArray(tasks) ? tasks.length : 0
    const friendsCount = Array.isArray(friends) ? friends.length : 0
    const requestsCount = Array.isArray(friendRequests) ? friendRequests.length : 0

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'My Tasks', icon: CheckSquare, count: tasksCount },
        { name: 'Friends', icon: Users, count: friendsCount },
        { name: 'Friend Requests', icon: UserRoundPlus, count: requestsCount },
        { name: 'Settings', icon: Settings },
    ]

    const handleNavigate = (name) => {
        console.log(name)
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
                className="cursor-pointer fixed left-3 top-3 z-[1100] flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm min-[701px]:hidden"
            >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar overlay"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-[1000] bg-slate-950/30 min-[701px]:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[1001]
                    flex h-dvh w-[240px] shrink-0 flex-col
                    border-r border-slate-200 bg-white
                    transition-transform duration-200

                    min-[701px]:sticky min-[701px]:top-0
                    min-[701px]:h-screen min-[701px]:translate-x-0

                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo */}
                <div className="flex h-14 shrink-0 items-center gap-2.5 px-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <Network size={17} />
                    </div>

                    <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
                        SyncHub
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-3">
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
                                    cursor-pointer flex h-10 w-full items-center gap-3
                                    rounded-lg px-3 text-left text-[13px]
                                    transition-colors

                                    ${active
                                        ? 'bg-indigo-50 font-semibold text-indigo-600'
                                        : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={active ? 2.2 : 1.8}
                                    className="shrink-0"
                                />

                                <span className="flex-1 whitespace-nowrap">
                                    {item.name}
                                </span>

                                {item.count !== undefined && (
                                    <span
                                        className={`
                                            text-xs font-medium tabular-nums
                                            ${item.name === 'Friend Requests' && item.count > 0
                                                ? 'text-rose-500'
                                                : active
                                                    ? 'text-indigo-600'
                                                    : 'text-slate-400'
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
                <div className="mt-auto shrink-0 border-t border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[13px] font-semibold text-slate-900">
                                {userName}
                            </h3>

                            <p className="truncate text-[11px] text-slate-400">
                                {userEmail}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onLogout}
                            title="Logout"
                            aria-label="Logout"
                            className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}