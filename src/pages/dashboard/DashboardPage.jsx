import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { ListTodo, Clock, MoreHorizontal, Plus, Loader2 } from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar.jsx'
import Header from '../../components/layout/Header.jsx'
import Logout from '../../features/auth/logout.jsx'

import DatePicker from '../../components/taskComponents/DatePicker.jsx'
import TaskDropdown from '../../components/taskComponents/TaskDropdown.jsx'
import DeleteTaskModal from '../../components/taskComponents/DeleteTaskModal.jsx'

import { fetchTasks, deleteTask } from '../../store/taskSlice'
import { getUserInitials } from '../../utils/userUtils'

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

    const dispatch = useDispatch()

    const [showLogout, setShowLogout] = useState(false)
    const [activeItem, setActiveItem] = useState('Overview')
    const [searchQuery, setSearchQuery] = useState('')

    // DatePicker, Dropdown, and Modal states
    const [openDatePickerId, setOpenDatePickerId] = useState(null)
    const [openDropdownId, setOpenDropdownId] = useState(null)
    const [taskToDelete, setTaskToDelete] = useState(null)

    // Get logged-in user from Redux
    const { user } = useSelector((state) => state.auth)

    // Get tasks from Redux
    const { tasks, isLoading, isDeleting, error } = useSelector((state) => state.tasks)

    // Fetch tasks on mount
    useEffect(() => {
        dispatch(fetchTasks())
    }, [dispatch])

    const userName = user?.name || 'User'

    const firstName = userName.trim().split(/\s+/)[0]

    const userInitials = getUserInitials(userName) || 'U'

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const displayedTasks = filteredTasks.slice(0, 5)

    // Format date from ISO string or date string
    const formatDate = (date) => {
        if (!date) return 'No date'

        const parsedDate = new Date(date)

        if (isNaN(parsedDate.getTime())) return date

        return parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        })
    }

    // Open DatePicker
    const handleDatePicker = (taskId) => {
        setOpenDatePickerId((prev) =>
            prev === taskId ? null : taskId
        )
        setOpenDropdownId(null)
    }

    // Update task date (local only for now — add API call later)
    const handleDateChange = (taskId, selectedDate) => {
        // TODO: dispatch updateTask thunk when API is ready
        console.log('Date changed for task:', taskId, selectedDate)
        setOpenDatePickerId(null)
    }

    // Open TaskDropdown
    const handleDropdown = (taskId) => {
        setOpenDropdownId((prev) =>
            prev === taskId ? null : taskId
        )
        setOpenDatePickerId(null)
    }

    // Dropdown actions
    const handleEditTask = (task) => {
        console.log('Edit task:', task)
        setOpenDropdownId(null)
    }

    const handleViewTask = (task) => {
        console.log('View task:', task)
        setOpenDropdownId(null)
    }

    const handleDeleteTask = (task) => {
        setTaskToDelete(task)
        setOpenDropdownId(null)
    }

    const handleConfirmDelete = async () => {
        if (!taskToDelete) return
        const taskId = taskToDelete._id || taskToDelete.id
        await dispatch(deleteTask(taskId))
        setTaskToDelete(null)
    }

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
                                value={String(tasks.length)}
                                description="Personal tasks recorded"
                                footer={`${tasks.filter(t => t.status !== 'completed').length} active`}
                                icon={<ListTodo size={16} className="text-indigo-600" />}
                            />

                            <MetricCard
                                label="HIGH PRIORITY"
                                value={String(tasks.filter(t => t.priority?.toLowerCase() === 'high').length)}
                                description="Requires immediate attention"
                                descriptionClass="text-rose-600 font-medium"
                                footer="Urgent breakdown"
                            />

                            <MetricCard
                                label="DUE 48 HOURS"
                                value={String(tasks.filter(t => {
                                    const due = new Date(t.dueDate || t.date)
                                    const now = new Date()
                                    const diff = due - now
                                    return diff >= 0 && diff <= 48 * 60 * 60 * 1000
                                }).length)}
                                description="Next due: Tomorrow, 5:00 PM"
                                descriptionClass="text-slate-700 font-medium"
                                footer="Upcoming"
                                icon={<Clock size={16} className="text-amber-500" />}
                            />

                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                            {/* Tasks */}
                            <section className="lg:col-span-2 rounded-xl border border-slate-200/70 bg-white shadow-2xs">

                                {/* Header */}
                                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                                    <div>
                                        <h2 className="text-[13px] font-bold text-slate-900">
                                            Upcoming Tasks
                                        </h2>
                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Sorted by due date and priority
                                        </p>
                                    </div>

                                    <button className="cursor-pointer text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-500 whitespace-nowrap">
                                        View all tasks ({tasks.length}) →
                                    </button>
                                </div>

                                {/* Table Column Headers */}
                                <div className="flex items-center gap-3 border-y border-slate-100 bg-slate-50/70 px-4 py-2 text-[10px] font-bold tracking-wider text-slate-700">
                                    <div className="w-[50px] shrink-0">
                                        STATE
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        TASK TITLE
                                    </div>
                                    <div className="w-[72px] shrink-0 text-center">
                                        PRIORITY
                                    </div>
                                    <div className="w-[84px] shrink-0 text-center">
                                        DUE DATE
                                    </div>
                                    <div className="w-7 shrink-0 text-center">
                                        MORE
                                    </div>
                                </div>

                                {/* Task Rows */}
                                <div className="divide-y divide-slate-100">

                                    {/* Loading State */}
                                    {isLoading && (
                                        <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                                            <Loader2 size={16} className="animate-spin text-indigo-600" />
                                            <span className="text-xs">Loading tasks...</span>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {error && !isLoading && (
                                        <div className="py-8 text-center text-xs text-red-500">
                                            {error}
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {!isLoading && !error && filteredTasks.length === 0 && (
                                        <div className="py-8 text-center text-xs text-slate-400">
                                            No tasks found.
                                        </div>
                                    )}

                                    {/* Task List */}
                                    {!isLoading && !error && displayedTasks.map((task) => {

                                        const taskId = task._id || task.id

                                        const normalizedPriority =
                                            typeof task.priority === 'string'
                                                ? task.priority.trim().toLowerCase()
                                                : 'low'

                                        const priorityConfig = {
                                            high: {
                                                label: 'High',
                                                textColor: 'text-red-600',
                                                dotColor: 'bg-red-500',
                                                badgeBg: 'bg-red-50',
                                                badgeText: 'text-red-600',
                                                badgeBorder: 'border-red-100',
                                            },
                                            medium: {
                                                label: 'Medium',
                                                textColor: 'text-amber-600',
                                                dotColor: 'bg-amber-500',
                                                badgeBg: 'bg-amber-50',
                                                badgeText: 'text-amber-600',
                                                badgeBorder: 'border-amber-100',
                                            },
                                            low: {
                                                label: 'Low',
                                                textColor: 'text-slate-500',
                                                dotColor: 'bg-slate-400',
                                                badgeBg: 'bg-slate-50',
                                                badgeText: 'text-slate-500',
                                                badgeBorder: 'border-slate-200',
                                            },
                                        }

                                        const config = priorityConfig[normalizedPriority] || priorityConfig.low

                                        // Check if this task's date is today
                                        const taskDateStr = task.dueDate || task.date
                                        const taskDate = new Date(taskDateStr)
                                        const todayDate = new Date()
                                        const isToday =
                                            taskDate.getFullYear() === todayDate.getFullYear() &&
                                            taskDate.getMonth() === todayDate.getMonth() &&
                                            taskDate.getDate() === todayDate.getDate()

                                        return (
                                            <div
                                                key={taskId}
                                                className={`relative flex items-center gap-3 px-4 py-3 transition-colors ${
                                                    isToday
                                                        ? 'bg-amber-50/60'
                                                        : 'hover:bg-slate-50/50'
                                                }`}
                                            >

                                                {/* Left: Priority text label */}
                                                <div className="w-[50px] shrink-0">
                                                    <span className={`text-[11px] font-medium ${config.textColor}`}>
                                                        {config.label}
                                                    </span>
                                                </div>

                                                {/* Center: Title + Description */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[12px] font-semibold text-slate-900 leading-snug">
                                                        {task.title}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">
                                                        {task.description}
                                                    </p>
                                                </div>

                                                {/* Priority Badge */}
                                                <div className="w-[72px] shrink-0 flex justify-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                                                        <span className={`h-[5px] w-[5px] rounded-full ${config.dotColor}`} />
                                                        {config.label}
                                                    </span>
                                                </div>

                                                {/* Date */}
                                                <div className="w-[84px] shrink-0 flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDatePicker(taskId)}
                                                        style={{ fontSize: '11px' }}
                                                        className="text-slate-500 hover:text-indigo-600 transition-colors whitespace-nowrap cursor-pointer"
                                                    >
                                                        {formatDate(taskDateStr)}
                                                    </button>
                                                </div>

                                                {/* More Options Button */}
                                                <div className="relative w-7 shrink-0 flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDropdown(taskId)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>

                                                    {/* Task Dropdown */}
                                                    {openDropdownId === taskId && (
                                                        <div className="absolute right-0 top-9 z-20">
                                                            <TaskDropdown
                                                                onEdit={() => handleEditTask(task)}
                                                                onView={() => handleViewTask(task)}
                                                                onDelete={() => handleDeleteTask(task)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* DatePicker Popover */}
                                                {openDatePickerId === taskId && (
                                                    <div className="absolute right-14 top-12 z-20">
                                                        <DatePicker
                                                            value={taskDateStr}
                                                            onChange={(date) => handleDateChange(taskId, date)}
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        )
                                    })}
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

                                    <button className="cursor-pointer flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/20 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50/50">
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

                                        <button className="cursor-pointer shrink-0 text-xs font-medium text-amber-800 transition-colors hover:text-amber-950">
                                            Review →
                                        </button>

                                    </div>

                                </section>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

            {/* Delete Task Modal */}
            <DeleteTaskModal
                isOpen={!!taskToDelete}
                task={taskToDelete}
                isDeleting={isDeleting}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleConfirmDelete}
            />

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