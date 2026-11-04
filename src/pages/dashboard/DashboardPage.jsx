import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import {
    ListTodo,
    Clock,
    MoreHorizontal,
    Plus,
    Loader2,
} from 'lucide-react'

import DatePicker from '../../components/taskComponents/DatePicker.jsx'
import TaskDropdown from '../../components/taskComponents/TaskDropdown.jsx'

import {
    fetchTasks,
    deleteTask,
} from '../../store/taskSlice.js'

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
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('')
    const [openDatePickerId, setOpenDatePickerId] = useState(null)
    const [openDropdownId, setOpenDropdownId] = useState(null)

    // Redux state
    const { user } = useSelector((state) => state.auth)

    const {
        tasks,
        isLoading,
        error,
    } = useSelector((state) => state.tasks)

    // Fetch tasks on mount and refresh every 5 seconds
    useEffect(() => {
        dispatch(fetchTasks())

        const intervalId = setInterval(() => {
            dispatch(fetchTasks())
        }, 5000)

        return () => clearInterval(intervalId)
    }, [dispatch])

    // User information
    const userName = user?.name || 'User'
    const firstName = userName.trim().split(/\s+/)[0]

    // Search tasks & limit max 5 items for dashboard view
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const displayedTasks = filteredTasks.slice(0, 5)

    // Format date
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

    // DatePicker
    const handleDatePicker = (taskId) => {
        setOpenDatePickerId((prev) =>
            prev === taskId ? null : taskId
        )

        setOpenDropdownId(null)
    }

    const handleDateChange = (taskId, selectedDate) => {
        console.log('Date changed:', taskId, selectedDate)
        setOpenDatePickerId(null)
    }

    // Task Dropdown
    const handleDropdown = (taskId) => {
        setOpenDropdownId((prev) =>
            prev === taskId ? null : taskId
        )

        setOpenDatePickerId(null)
    }

    const handleEditTask = (task) => {
        console.log('Edit task:', task)
        setOpenDropdownId(null)
    }

    const handleViewTask = (task) => {
        console.log('View task:', task)
        setOpenDropdownId(null)
    }

    // Delete task using Redux
    const handleDeleteTask = async (taskId) => {
        try {
            await dispatch(deleteTask(taskId)).unwrap()
            setOpenDropdownId(null)
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    return (
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
                <section className="lg:col-span-2 rounded-xl border border-slate-200/70 bg-white shadow-2xs overflow-visible">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pb-3 pt-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-[13px] font-bold text-slate-900">
                                Upcoming Tasks
                            </h2>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                                Sorted by due date and priority
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/tasks')}
                            className="!text-[12px] font-medium text-indigo-600 hover:text-indigo-500 whitespace-nowrap cursor-pointer"
                        >
                            View all tasks ({tasks.length}) →
                        </button>
                    </div>

                    {/* Table Column Headings */}
                    <div className="grid grid-cols-[80px_1fr_100px_100px_60px] items-center px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                        <div>State</div>
                        <div>Task Title</div>
                        <div>Priority</div>
                        <div>Due Date</div>
                        <div className="text-right">More</div>
                    </div>

                    {/* Task Rows */}
                    <div className="divide-y divide-slate-100 overflow-visible cursor-pointer">

                        {/* Loading */}
                        {isLoading && tasks.length === 0 && (
                            <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                                <Loader2
                                    size={16}
                                    className="animate-spin text-indigo-600"
                                />
                                <span className="text-xs">
                                    Loading tasks...
                                </span>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="py-8 text-center text-xs text-red-500">
                                {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && displayedTasks.length === 0 && (
                            <div className="py-8 text-center text-xs text-slate-400">
                                No tasks found.
                            </div>
                        )}

                        {/* Task List (Max 5 items) */}
                        {!error && displayedTasks.map((task) => {
                            const taskId = task._id || task.id

                            const normalizedPriority =
                                typeof task.priority === 'string'
                                    ? task.priority.toLowerCase()
                                    : 'low'

                            const priorityConfig = {
                                high: {
                                    textColor: 'text-red-600',
                                    dotColor: 'bg-red-500',
                                    badgeBg: 'bg-red-50',
                                    badgeText: 'text-red-600',
                                    badgeBorder: 'border-red-100',
                                },
                                medium: {
                                    textColor: 'text-amber-600',
                                    dotColor: 'bg-amber-500',
                                    badgeBg: 'bg-amber-50',
                                    badgeText: 'text-amber-600',
                                    badgeBorder: 'border-amber-100',
                                },
                                low: {
                                    textColor: 'text-slate-500',
                                    dotColor: 'bg-slate-400',
                                    badgeBg: 'bg-slate-50',
                                    badgeText: 'text-slate-500',
                                    badgeBorder: 'border-slate-200',
                                },
                            }

                            const config =
                                priorityConfig[normalizedPriority] ||
                                priorityConfig.low

                            const taskDateStr = task.dueDate || task.date
                            const taskDate = new Date(taskDateStr)
                            const todayDate = new Date()

                            const isOverdue = taskDate < todayDate && !isNaN(taskDate.getTime())

                            const isToday =
                                taskDate.getFullYear() === todayDate.getFullYear() &&
                                taskDate.getMonth() === todayDate.getMonth() &&
                                taskDate.getDate() === todayDate.getDate()

                            return (
                                <div
                                    key={taskId}
                                    className={`relative grid grid-cols-[80px_1fr_100px_100px_60px] items-center px-6 py-3 transition-colors overflow-visible ${isToday
                                        ? 'bg-amber-50/60'
                                        : 'hover:bg-slate-50/50'
                                        }`}
                                >

                                    {/* State (Default / Overdue) */}
                                    <div>
                                        <span className={`text-[11px] font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                                            {isOverdue ? 'Overdue' : 'Default'}
                                        </span>
                                    </div>

                                    {/* Title + Description */}
                                    <div className="min-w-0 pr-4">
                                        <p className="text-[12px] font-semibold text-slate-900 leading-snug truncate">
                                            {task.title}
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-400 leading-snug truncate">
                                            {task.description}
                                        </p>
                                    </div>

                                    {/* Priority Badge */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}>
                                            <span className={`h-[5px] w-[5px] rounded-full ${config.dotColor}`} />
                                            {task.priority}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="relative overflow-visible">
                                        <button
                                            type="button"
                                            onClick={() => handleDatePicker(taskId)}
                                            style={{ fontSize: '11px' }}
                                            className="cursor-pointer whitespace-nowrap text-slate-500 transition-colors hover:text-indigo-600"
                                        >
                                            {formatDate(taskDateStr)}
                                        </button>

                                        {/* DatePicker - Fixed positioning to avoid clipping */}
                                        {openDatePickerId === taskId && (
                                            <div className="absolute left-0 top-8 z-50 bg-white shadow-xl rounded-xl border border-slate-200 p-2">
                                                <DatePicker
                                                    value={taskDateStr}
                                                    onChange={(date) => handleDateChange(taskId, date)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* More Options */}
                                    <div className="relative flex justify-end overflow-visible">
                                        <button
                                            type="button"
                                            onClick={() => handleDropdown(taskId)}
                                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>

                                        {openDropdownId === taskId && (
                                            <div className="absolute right-0 top-9 z-50">
                                                <TaskDropdown
                                                    onEdit={() => handleEditTask(task)}
                                                    onView={() => handleViewTask(task)}
                                                    onDelete={() => handleDeleteTask(taskId)}
                                                />
                                            </div>
                                        )}
                                    </div>

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

                            <button className="!text-xs font-medium text-indigo-600 cursor-pointer">
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

                        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/20 py-2 !text-xs font-medium text-indigo-600 hover:bg-indigo-50/50 cursor-pointer">
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

                            <button className="shrink-0 !text-xs font-medium text-amber-800 cursor-pointer">
                                Review →
                            </button>
                        </div>
                    </section>

                </div>
            </div>

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