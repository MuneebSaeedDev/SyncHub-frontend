import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ArrowLeft, Calendar, AlertCircle, Edit, Trash2, Home, ChevronRight, Loader2, Share2 } from 'lucide-react'
import { getTaskByIdAPI } from '../../store/taskAPI'
import { deleteTask } from '../../store/taskSlice'
import { getUserInitials } from '../../utils/userUtils'
import EditTask from './EditTask'
import DeleteTaskModal from '../../components/taskComponents/DeleteTaskModal'
import ShareTaskModal from '../../components/sharedTaskComponents/ShareTaskModal'

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
    const [isShareOpen, setIsShareOpen] = useState(false)

    // Check where the user came from (default to /tasks)
    const previousPath = location.state?.from || '/tasks'
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
            <div className="flex h-96 items-center justify-center gap-2 text-[#41454d]">
                <Loader2 className="h-5 w-5 animate-spin text-[#181d26]" />
                <span className="!text-xs font-medium">Loading task details...</span>
            </div>
        )
    }

    if (error || !currentTask) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 !text-xs font-medium text-[#1b61c9] hover:text-[#1a3866] transition-colors cursor-pointer mb-6"
                >
                    <ArrowLeft size={14} />
                    Back to {fromLabel}
                </button>
                <div className="rounded-[6px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-5 text-center text-xs text-[#aa2d00]">
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
            bg: 'bg-[#aa2d00]/10',
            text: 'text-[#aa2d00]',
            border: 'border-[#aa2d00]/25',
            dot: 'bg-[#aa2d00]',
            subText: 'Critical focus item',
        },
        medium: {
            bg: 'bg-[#d9a441]/15',
            text: 'text-[#91650c]',
            border: 'border-[#d9a441]/35',
            dot: 'bg-[#d9a441]',
            subText: 'Moderate priority item',
        },
        low: {
            bg: 'bg-[#f8fafc]',
            text: 'text-[#41454d]',
            border: 'border-[#dddddd]',
            dot: 'bg-[#9297a0]',
            subText: 'Low priority item',
        },
    }

    const priorityStyle = priorityBadgeConfig[normalizedPriority] || priorityBadgeConfig.high
    const dueBadgeText = formatDueBadge(currentTask.dueDate)

    // User details
    const userName = user?.name || 'Alex Morgan'
    const userInitials = getUserInitials(userName) || 'AM'

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-12 text-[#181d26]">
            {/* Breadcrumbs Row */}
            <nav className="flex items-center gap-2 !text-xs font-normal text-[#41454d]" aria-label="Breadcrumb">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 hover:text-[#181d26] transition-colors cursor-pointer"
                >
                    <Home size={13} className="text-[#41454d]" />
                </button>
                <ChevronRight size={12} className="text-[#9297a0]" />
                <button
                    type="button"
                    onClick={() => navigate('/tasks')}
                    className="hover:text-[#181d26] transition-colors cursor-pointer"
                >
                    My Tasks
                </button>
                <ChevronRight size={12} className="text-[#9297a0]" />
                <span className="font-medium text-[#181d26]">Task Details</span>
            </nav>

            {/* Top Action Bar */}
            <div className="flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 !text-xs font-medium text-[#1b61c9] hover:text-[#1a3866] transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    Back to {fromLabel}
                </button>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsShareOpen(true)}
                        className="flex items-center gap-1.5 rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] hover:border-[#9297a0] transition-colors cursor-pointer shadow-xs"
                    >
                        <Share2 size={13} />
                        Share
                    </button>
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] hover:border-[#9297a0] transition-colors cursor-pointer shadow-xs"
                    >
                        <Edit size={13} />
                        Edit Task
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="flex items-center gap-1.5 rounded-[8px] bg-[#aa2d00] px-3.5 py-2 !text-xs font-medium text-white hover:bg-[#8f2500] transition-colors cursor-pointer shadow-xs"
                    >
                        <Trash2 size={13} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Task Card */}
            <div className="rounded-[12px] border border-[#dddddd] bg-white p-6 sm:p-8 shadow-xs">
                {/* Header Metadata: Priority Badge & Due Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 !text-xs font-medium border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`}></span>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </span>

                    {dueBadgeText && (
                        <div className="flex items-center gap-1.5 rounded-[6px] bg-[#f8fafc] px-2.5 py-1 !text-xs font-medium text-[#41454d] border border-[#dddddd]">
                            <Calendar size={13} className="text-[#41454d]" />
                            <span>{dueBadgeText}</span>
                        </div>
                    )}
                </div>

                {/* Task Title */}
                <h1 className="!text-xl sm:!text-2xl font-semibold text-[#181d26] tracking-tight leading-snug">
                    {currentTask.title}
                </h1>

                {/* Task ID */}
                <p className="mt-1.5 !text-xs font-mono text-[#41454d]">
                    Task ID: {taskId}
                </p>

                {/* Divider */}
                <hr className="my-5 border-[#dddddd]" />

                {/* Description Section */}
                <div>
                    <h2 className="!text-xs font-medium text-[#181d26] mb-2">
                        Description
                    </h2>
                    <p className="!text-xs text-[#333840] leading-relaxed whitespace-pre-wrap">
                        {currentTask.description || 'No description provided for this task.'}
                    </p>
                </div>

                {/* Details Grid Container */}
                <div className="mt-7 rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                        {/* Due Date Detail */}
                        <div>
                            <span className="text-[11px] font-normal text-[#41454d] block mb-1">
                                Due date
                            </span>
                            <div className="flex items-center gap-2 !text-xs font-medium text-[#181d26]">
                                <Calendar size={14} className="text-[#41454d] shrink-0" />
                                <span>{formatFullDateTime(currentTask.dueDate, true)}</span>
                            </div>
                        </div>

                        {/* Priority Level Detail */}
                        <div>
                            <span className="text-[11px] font-normal text-[#41454d] block mb-1">
                                Priority level
                            </span>
                            <div className={`flex items-center gap-1.5 !text-xs font-medium ${priorityStyle.text}`}>
                                <AlertCircle size={14} className="shrink-0" />
                                <span>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}{' '}
                                    <span className="font-normal text-[11px] text-[#41454d]">
                                        ({priorityStyle.subText})
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Created Detail */}
                        <div>
                            <span className="text-[11px] font-normal text-[#41454d] block mb-1">
                                Created
                            </span>
                            <div className="flex items-center gap-2 !text-xs font-normal text-[#333840]">
                                <span>{formatFullDateTime(currentTask.createdAt)}</span>
                            </div>
                        </div>

                        {/* Last Updated Detail */}
                        <div>
                            <span className="text-[11px] font-normal text-[#41454d] block mb-1">
                                Last updated
                            </span>
                            <div className="flex items-center gap-2 !text-xs font-normal text-[#333840]">
                                <span>{formatFullDateTime(currentTask.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ownership Detail */}
                    <div className="mt-5 pt-5 border-t border-[#dddddd]">
                        <span className="text-[11px] font-normal text-[#41454d] block mb-2">
                            Ownership
                        </span>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-white border border-[#dddddd] text-[#181d26] text-xs font-medium">
                                {userInitials}
                            </div>
                            <span className="!text-xs font-normal text-[#333840]">
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

            {/* Share Task Modal */}
            <ShareTaskModal
                isOpen={isShareOpen}
                preselectedTask={currentTask}
                onClose={() => setIsShareOpen(false)}
            />
        </div>
    )
}
