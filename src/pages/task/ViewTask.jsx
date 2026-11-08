import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Calendar, AlertCircle, Edit, Trash2, Home, ChevronRight, Loader2 } from 'lucide-react'
import { getTaskByIdAPI } from '../../store/taskAPI'
import { deleteTask } from '../../store/taskSlice'
import { getUserInitials } from '../../utils/userUtils'
import EditTask from './EditTask'
import DeleteTaskModal from '../../components/taskComponents/DeleteTaskModal'

export default function ViewTask({
    task: taskProp,
    onBack: onBackProp,
    onEdit: onEditProp,
    onDelete: onDeleteProp,
}) {
    const { id: paramTaskId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const { tasks, isDeleting } = useSelector((state) => state.tasks)
    const { user } = useSelector((state) => state.auth)

    const [currentTask, setCurrentTask] = useState(taskProp || null)
    const [loading, setLoading] = useState(!taskProp && Boolean(paramTaskId))
    const [error, setError] = useState(null)

    // Edit and Delete Modal States
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Check where the user came from (default to /tasks)
    const previousPath = location.state?.from || '/tasks'
    console.log('Previous Path:', previousPath) // Debugging line
    const fromLabel = previousPath.includes('dashboard') ? 'Dashboard' : 'My Tasks'

    // Fetch or resolve task
    useEffect(() => {
        if (taskProp) {
            setCurrentTask(taskProp)
            return
        }

        const taskId = paramTaskId
        if (!taskId) return

        // First check in Redux tasks list
        const existingTask = tasks.find(
            (t) => (t._id && t._id === taskId) || (t.id && t.id === taskId)
        )

        if (existingTask) {
            setCurrentTask(existingTask)
            setLoading(false)
            return
        }

        // Otherwise fetch from API
        let isMounted = true
        setLoading(true)
        setError(null)

        getTaskByIdAPI(taskId)
            .then((res) => {
                if (isMounted) {
                    const fetched = res.userTask || res.task || res
                    setCurrentTask(fetched)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load task details:', err)
                    setError(err?.response?.data?.message || 'Failed to load task details')
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [taskProp, paramTaskId, tasks])

    // Handle Back
    const handleBack = () => {
        if (onBackProp) {
            onBackProp()
        } else {
            navigate(previousPath)
        }
    }

    // Handle Edit Click
    const handleEdit = () => {
        if (onEditProp) {
            onEditProp(currentTask)
        } else {
            setIsEditOpen(true)
        }
    }

    // Handle Delete Click
    const handleDeleteClick = () => {
        if (onDeleteProp) {
            onDeleteProp(currentTask)
        } else {
            setIsDeleteOpen(true)
        }
    }

    // Confirm Delete Action
    const handleConfirmDelete = async () => {
        const taskId = currentTask?._id || currentTask?.id
        if (!taskId) return

        try {
            await dispatch(deleteTask(taskId)).unwrap()
            setIsDeleteOpen(false)
            navigate(previousPath)
        } catch (err) {
            console.error('Failed to delete task:', err)
        }
    }

    // Formatters
    const formatDueBadge = (dueDate) => {
        if (!dueDate) return null
        const due = new Date(dueDate)
        if (isNaN(due.getTime())) return `Due on ${dueDate}`

        const now = new Date()
        const diffTime = due.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const formattedDate = due.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        })

        if (diffDays < 0) {
            const overdueDays = Math.abs(diffDays)
            return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''} — ${formattedDate}`
        }
        if (diffDays === 0) {
            return `Due today — ${formattedDate}`
        }
        if (diffDays === 1) {
            return `Due tomorrow — ${formattedDate}`
        }
        return `Due in ${diffDays} days — ${formattedDate}`
    }

    const formatFullDateTime = (dateVal, isDueDate = false) => {
        if (!dateVal) return 'Not set'
        const date = new Date(dateVal)
        if (isNaN(date.getTime())) return dateVal

        if (isDueDate) {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
            const monthDayYear = date.toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric',
            })
            const time = date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
            return `${dayName}, ${monthDayYear} at ${time}`
        }

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center gap-2 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <span className="text-sm font-medium">Loading task details...</span>
            </div>
        )
    }

    if (error || !currentTask) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer mb-6"
                >
                    <ArrowLeft size={16} />
                    Back to {fromLabel}
                </button>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                    {error || 'Task not found.'}
                </div>
            </div>
        )
    }

    const taskId = currentTask._id || currentTask.id || ''
    const priority = currentTask.priority || 'High'
    const normalizedPriority = priority.toLowerCase()

    const priorityBadgeConfig = {
        high: {
            bg: 'bg-red-50',
            text: 'text-red-600',
            border: 'border-red-100',
            dot: 'bg-red-600',
            subText: 'Critical focus item',
        },
        medium: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            dot: 'bg-amber-500',
            subText: 'Moderate priority item',
        },
        low: {
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-200',
            dot: 'bg-slate-400',
            subText: 'Low priority item',
        },
    }

    const priorityStyle = priorityBadgeConfig[normalizedPriority] || priorityBadgeConfig.high
    const dueBadgeText = formatDueBadge(currentTask.dueDate)

    // User details
    const userName = user?.name || 'Alex Morgan'
    const userInitials = getUserInitials(userName) || 'AM'

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
            {/* Breadcrumbs Row */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                >
                    <Home size={14} className="text-slate-400" />
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="hover:text-slate-800 transition-colors cursor-pointer"
                >
                    My Tasks
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-semibold text-slate-800">Task Details</span>
            </nav>

            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Back to {fromLabel}
                </button>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                    >
                        <Edit size={15} />
                        Edit Task
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-xs cursor-pointer"
                    >
                        <Trash2 size={15} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Task Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                {/* Header Metadata: Priority Badge & Due Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot} animate-pulse`}></span>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </span>

                    {dueBadgeText && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50/90 px-3 py-1.5 text-xs font-medium text-amber-800 border border-amber-200/70">
                            <Calendar size={14} className="text-amber-600" />
                            <span>{dueBadgeText}</span>
                        </div>
                    )}
                </div>

                {/* Task Title */}
                <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-snug">
                    {currentTask.title}
                </h1>

                {/* Task ID */}
                <p className="mt-2 text-xs font-mono text-slate-400">
                    Task ID: {taskId}
                </p>

                {/* Divider */}
                <hr className="my-6 border-slate-100" />

                {/* Description Section */}
                <div>
                    <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2.5">
                        DESCRIPTION
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {currentTask.description || 'No description provided for this task.'}
                    </p>
                </div>

                {/* Details Grid Container */}
                <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/60 p-6 sm:p-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        {/* Due Date Detail */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                DUE DATE
                            </span>
                            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                                <Calendar size={16} className="text-slate-500 shrink-0" />
                                <span>{formatFullDateTime(currentTask.dueDate, true)}</span>
                            </div>
                        </div>

                        {/* Priority Level Detail */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                PRIORITY LEVEL
                            </span>
                            <div className={`flex items-center gap-2 text-sm font-semibold ${priorityStyle.text}`}>
                                <AlertCircle size={16} className="shrink-0" />
                                <span>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}{' '}
                                    <span className="font-normal text-xs text-slate-500">
                                        ({priorityStyle.subText})
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Created Detail */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                CREATED
                            </span>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <span>{formatFullDateTime(currentTask.createdAt)}</span>
                            </div>
                        </div>

                        {/* Last Updated Detail */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                LAST UPDATED
                            </span>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <span>{formatFullDateTime(currentTask.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ownership Detail */}
                    <div className="mt-6 pt-6 border-t border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                            OWNERSHIP
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold">
                                {userInitials}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                                Personal Task (Private to {userName})
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Task Modal */}
            <EditTask
                isOpen={isEditOpen}
                task={currentTask}
                onClose={() => setIsEditOpen(false)}
                onDelete={() => {
                    setIsEditOpen(false)
                    setIsDeleteOpen(true)
                }}
            />

            {/* Delete Task Modal */}
            <DeleteTaskModal
                isOpen={isDeleteOpen}
                task={currentTask}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}
