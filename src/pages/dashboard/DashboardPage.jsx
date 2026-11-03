import { useState } from 'react'
import { useSelector } from 'react-redux'

import {
    ListTodo,
    Clock,
    MoreHorizontal,
    Plus,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar.jsx'
import Header from '../../components/layout/Header.jsx'
import Logout from '../../features/auth/logout.jsx'

import { getUserInitials } from '../../utils/userUtils'

// Temporary demo data
const tasks = [
    {
        title: 'Deploy Production Security Hotfix',
        description: 'Apply JWT verification hardening for auth middleware.',
        priority: 'High',
        date: 'Nov 01, 2026',
    },
    {
        title: 'Finalize Quarterly Engineering Sprint Scope',
        description: 'Define deliverables and milestones for next sprint.',
        priority: 'High',
        date: 'Nov 02, 2026',
    },
    {
        title: 'Update Database Migration Scripts for Cluster',
        description: 'Update schema migration scripts for the new cluster config.',
        priority: 'Medium',
        date: 'Nov 04, 2026',
    },
    {
        title: 'Review API Documentation and Postman Collections',
        description: 'Audit and update all Postman collection endpoints.',
        priority: 'Low',
        date: 'Nov 08, 2026',
    },
]

const friends = [
    {
        name: 'Sarah Kim',
        email: 'sarah@example.com',
        initials: 'SK',
        color: 'bg-sky-100 text-sky-700',
    },
    {
        name: 'Jordan Diaz',
        email: 'jordan@example.com',
        initials: 'JD',
        color: 'bg-blue-100 text-blue-700',
    },
    {
        name: 'Nina Okafor',
        email: 'nina@example.com',
        initials: 'NO',
        color: 'bg-emerald-100 text-emerald-700',
    },
]

export default function DashboardPage() {

    const [showLogout, setShowLogout] = useState(false)
    const [activeItem, setActiveItem] = useState('Overview')
    const [searchQuery, setSearchQuery] = useState('')

    // Get logged-in user from Redux
    const { user } = useSelector((state) => state.auth)

    const userName = user?.name || 'User'

    const firstName = userName.trim().split(/\s+/)[0]

    const userInitials = getUserInitials(userName) || 'U'

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-slate-50/40 text-slate-800">

            {/* Sidebar */}
            <Sidebar
                activeItem={activeItem}
                onNavigate={setActiveItem}
                onLogout={() => setShowLogout(true)}
                user={user}
            />

            <main className="flex min-w-0 flex-1 flex-col">

                {/* Header */}
                <Header
                    title={activeItem}
                    searchValue={searchQuery}
                    onSearch={setSearchQuery}
                    onNotifications={() => console.log('Notifications')}
                    onProfileClick={() => console.log('Profile')}
                    userInitial={userInitials}
                />

                <div className="flex-1 p-5 sm:p-6">

                    <div className="mx-auto max-w-7xl space-y-6">

                        {/* Greeting */}
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                            <div>
                                <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Good morning, {firstName}
                                </h1>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Here is your personal task briefing and priority breakdown.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-500"
                            >
                                <Plus size={16} />
                                Create Task
                            </button>

                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                            <MetricCard
                                label="TOTAL TASKS"
                                value="12"
                                description="Personal tasks recorded"
                                footer="8 active"
                                icon={<ListTodo size={16} className="text-indigo-600" />}
                            />

                            <MetricCard
                                label="HIGH PRIORITY"
                                value="4"
                                description="Requires immediate attention"
                                descriptionClass="text-rose-600 font-medium"
                                footer="Urgent breakdown"
                            />

                            <MetricCard
                                label="DUE 48 HOURS"
                                value="3"
                                description="Next due: Tomorrow, 5:00 PM"
                                descriptionClass="text-slate-700 font-medium"
                                footer="Upcoming"
                                icon={<Clock size={16} className="text-amber-500" />}
                            />

                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                            {/* Tasks */}
                            <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-2xs lg:col-span-2">

                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Upcoming Tasks
                                        </h2>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Sorted by due date and priority
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                        View all (12) →
                                    </button>

                                </div>

                                <div className="divide-y divide-slate-100">

                                    {filteredTasks.map((task) => (

                                        <div
                                            key={task.title}
                                            className="flex flex-col justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center"
                                        >

                                            <div className="flex min-w-0 items-start gap-3">

                                                <span className={`shrink-0 pt-0.5 text-[11px] font-semibold uppercase ${task.priority === 'High'
                                                        ? 'text-rose-600'
                                                        : task.priority === 'Medium'
                                                            ? 'text-amber-600'
                                                            : 'text-slate-400'
                                                    }`}>
                                                    {task.priority}
                                                </span>

                                                <div className="min-w-0">
                                                    <h3 className="truncate text-xs font-semibold text-slate-900">
                                                        {task.title}
                                                    </h3>

                                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                                        {task.description}
                                                    </p>
                                                </div>

                                            </div>

                                            <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">

                                                <span className="w-20 text-right text-[11px] font-medium text-slate-400">
                                                    {task.date}
                                                </span>

                                                <button
                                                    type="button"
                                                    aria-label={`More options for ${task.title}`}
                                                    className="rounded-md border border-slate-200 p-1 text-slate-400 hover:bg-white hover:text-slate-600"
                                                >
                                                    <MoreHorizontal size={14} />
                                                </button>

                                            </div>

                                        </div>

                                    ))}

                                    {filteredTasks.length === 0 && (
                                        <p className="p-6 text-center text-xs text-slate-400">
                                            No tasks found matching your search.
                                        </p>
                                    )}

                                </div>
                            </section>

                            {/* Friends */}
                            <div className="space-y-4">

                                <section className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-2xs">

                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Friends
                                        </h2>

                                        <button className="text-xs font-medium text-indigo-600">
                                            Manage (5)
                                        </button>
                                    </div>

                                    <div className="mb-2 flex items-center gap-2">

                                        <div className="flex -space-x-1.5 overflow-hidden">

                                            {friends.map((friend) => (
                                                <span
                                                    key={friend.initials}
                                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white ${friend.color}`}
                                                >
                                                    {friend.initials}
                                                </span>
                                            ))}

                                        </div>

                                        <span className="inline-flex h-5 items-center justify-center rounded-full bg-slate-100 px-2 text-[10px] font-medium text-slate-600">
                                            +2
                                        </span>

                                    </div>

                                    <p className="mb-4 text-[11px] text-slate-400">
                                        5 connected friends
                                    </p>

                                    <div className="mb-4 divide-y divide-slate-100">

                                        {friends.map((friend) => (

                                            <div
                                                key={friend.email}
                                                className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0"
                                            >

                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${friend.color}`}>
                                                    {friend.initials}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-slate-900">
                                                        {friend.name}
                                                    </p>

                                                    <p className="truncate text-[10px] text-slate-400">
                                                        {friend.email}
                                                    </p>
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                    <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/20 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50/50">
                                        <Plus size={14} />
                                        Connect New Friend
                                    </button>

                                </section>

                                {/* Friend Requests */}
                                <section className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3.5 shadow-2xs">

                                    <div className="flex items-center justify-between gap-2">

                                        <p className="text-xs text-amber-900">
                                            You have <span className="font-semibold">2 pending requests</span>.
                                        </p>

                                        <button className="shrink-0 text-xs font-medium text-amber-800">
                                            Review →
                                        </button>

                                    </div>

                                </section>

                            </div>

                        </div>

                    </div>

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

// Metric Card
function MetricCard({
    label,
    value,
    description,
    descriptionClass = 'text-slate-400',
    footer,
    icon,
}) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-4 shadow-2xs">

            <div>

                <div className="flex items-center justify-between">

                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        {label}
                    </span>

                    {icon && <span>{icon}</span>}

                </div>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                    {value}
                </p>

                <p className={`mt-0.5 text-xs ${descriptionClass}`}>
                    {description}
                </p>

            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">

                <span className="text-[11px] font-medium text-slate-400">
                    {footer}
                </span>

            </div>

        </div>
    )
}