import { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    Share2,
    Search,
    Plus,
    Loader2,
    Inbox,
    Send,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react'
import {
    fetchReceivedSharedTasks,
    fetchSentSharedTasks,
    updateSharedTaskStatus,
    deleteSharedTask,
} from '../../store/sharedTaskSlice'
import { fetchFriends } from '../../store/friendSlice'
import { fetchTasks } from '../../store/taskSlice'
import SharedTaskCard from '../../components/sharedTaskComponents/SharedTaskCard'
import ShareTaskModal from '../../components/sharedTaskComponents/ShareTaskModal'
import UnshareConfirmModal from '../../components/sharedTaskComponents/UnshareConfirmModal'

export default function SharedTasksPage() {
    const dispatch = useDispatch()

    // Redux state
    const {
        received = [],
        sent = [],
        isLoadingReceived,
        isLoadingSent,
        updatingId,
        deletingId,
        error,
    } = useSelector((state) => state.sharedTasks)

    // Local UI states
    const [activeTab, setActiveTab] = useState('received') // 'received' | 'sent'
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'pending' | 'in-progress' | 'completed'
    const [priorityFilter, setPriorityFilter] = useState('all') // 'all' | 'high' | 'medium' | 'low'

    // Modal states
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [taskToUnshare, setTaskToUnshare] = useState(null)

    // Fetch initial data
    useEffect(() => {
        dispatch(fetchReceivedSharedTasks())
        dispatch(fetchSentSharedTasks())
        dispatch(fetchFriends())
        dispatch(fetchTasks())
    }, [dispatch])

    // Current tab items
    const rawItems = activeTab === 'received' ? received : sent
    const isLoading = activeTab === 'received' ? isLoadingReceived : isLoadingSent

    // Filter items by search, status, and priority
    const filteredItems = useMemo(() => {
        return rawItems.filter((item) => {
            const task = item.task_id || {}
            const person = activeTab === 'received' ? item.shared_by : item.collaborator

            // Search query matching
            const q = searchQuery.toLowerCase().trim()
            const matchesSearch =
                !q ||
                task.title?.toLowerCase().includes(q) ||
                task.description?.toLowerCase().includes(q) ||
                person?.name?.toLowerCase().includes(q) ||
                person?.email?.toLowerCase().includes(q)

            // Status filter
            const matchesStatus =
                statusFilter === 'all' || item.status?.toLowerCase() === statusFilter

            // Priority filter
            const matchesPriority =
                priorityFilter === 'all' ||
                task.priority?.toLowerCase() === priorityFilter

            return matchesSearch && matchesStatus && matchesPriority
        })
    }, [rawItems, activeTab, searchQuery, statusFilter, priorityFilter])

    // Status update handler
    const handleStatusChange = (id, newStatus) => {
        dispatch(updateSharedTaskStatus({ id, status: newStatus }))
    }

    // Delete / unshare confirmation handler
    const handleConfirmUnshare = async () => {
        if (!taskToUnshare) return
        try {
            await dispatch(deleteSharedTask(taskToUnshare._id)).unwrap()
            setTaskToUnshare(null)
        } catch {
            // Error handled via Redux toast
        }
    }

    // Metric summaries
    const receivedCount = received.length
    const sentCount = sent.length
    const totalCount = receivedCount + sentCount
    const inProgressCount = [...received, ...sent].filter(
        (i) => i.status === 'in-progress'
    ).length
    const completedCount = [...received, ...sent].filter(
        (i) => i.status === 'completed'
    ).length

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12 text-[#181d26]">
            {/* Top Heading & Actions */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="!text-xl font-semibold tracking-tight text-[#181d26]">
                        Shared Tasks
                    </h1>
                    <p className="mt-0.5 !text-xs text-[#41454d]">
                        Collaborate on shared tasks with accepted friends ({totalCount} total collaborations).
                    </p>
                </div>

                {/* Primary Action Button */}
                <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#181d26] px-4 py-2 !text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#0d1218] active:bg-[#0d1218]"
                >
                    <Plus size={14} />
                    <Share2 size={13} />
                    <span>Share a Task</span>
                </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-[12px] border border-[#dddddd] bg-white p-4 shadow-xs transition-colors hover:border-[#9297a0]">
                    <div className="flex items-center justify-between">
                        <span className="!text-xs text-[#41454d]">Shared with Me</span>
                        <Inbox size={15} className="text-[#181d26]" />
                    </div>
                    <p className="mt-2 !text-xl font-medium tracking-tight text-[#181d26] tabular-nums">
                        {receivedCount}
                    </p>
                    <p className="mt-0.5 !text-[11px] text-[#41454d]">Tasks assigned to you</p>
                </div>

                <div className="rounded-[12px] border border-[#dddddd] bg-white p-4 shadow-xs transition-colors hover:border-[#9297a0]">
                    <div className="flex items-center justify-between">
                        <span className="!text-xs text-[#41454d]">Shared by Me</span>
                        <Send size={15} className="text-[#181d26]" />
                    </div>
                    <p className="mt-2 !text-xl font-medium tracking-tight text-[#181d26] tabular-nums">
                        {sentCount}
                    </p>
                    <p className="mt-0.5 !text-[11px] text-[#41454d]">Tasks sent to friends</p>
                </div>

                <div className="rounded-[12px] border border-[#dddddd] bg-white p-4 shadow-xs transition-colors hover:border-[#9297a0]">
                    <div className="flex items-center justify-between">
                        <span className="!text-xs text-[#41454d]">In Progress</span>
                        <Clock size={15} className="text-[#1b61c9]" />
                    </div>
                    <p className="mt-2 !text-xl font-medium tracking-tight text-[#181d26] tabular-nums">
                        {inProgressCount}
                    </p>
                    <p className="mt-0.5 !text-[11px] text-[#41454d]">Active collaborations</p>
                </div>

                <div className="rounded-[12px] border border-[#dddddd] bg-white p-4 shadow-xs transition-colors hover:border-[#9297a0]">
                    <div className="flex items-center justify-between">
                        <span className="!text-xs text-[#41454d]">Completed</span>
                        <CheckCircle2 size={15} className="text-[#006400]" />
                    </div>
                    <p className="mt-2 !text-xl font-medium tracking-tight text-[#181d26] tabular-nums">
                        {completedCount}
                    </p>
                    <p className="mt-0.5 !text-[11px] text-[#41454d]">Done tasks</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-[#dddddd]">
                <nav className="flex space-x-6" aria-label="Shared task tabs">
                    {/* Tab 1: Shared with Me */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('received')}
                        className={`cursor-pointer inline-flex items-center gap-2 py-2.5 px-0.5 !text-xs font-medium border-b-2 transition-colors relative ${
                            activeTab === 'received'
                                ? 'border-[#181d26] text-[#181d26]'
                                : 'border-transparent text-[#41454d] hover:text-[#181d26]'
                        }`}
                    >
                        <span>Shared with Me</span>
                        <span
                            className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                                activeTab === 'received'
                                    ? 'bg-[#181d26] text-white'
                                    : 'bg-[#e0e2e6] text-[#41454d]'
                            }`}
                        >
                            {receivedCount}
                        </span>
                    </button>

                    {/* Tab 2: Shared by Me */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('sent')}
                        className={`cursor-pointer inline-flex items-center gap-2 py-2.5 px-0.5 !text-xs font-medium border-b-2 transition-colors relative ${
                            activeTab === 'sent'
                                ? 'border-[#181d26] text-[#181d26]'
                                : 'border-transparent text-[#41454d] hover:text-[#181d26]'
                        }`}
                    >
                        <span>Shared by Me</span>
                        <span
                            className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                                activeTab === 'sent'
                                    ? 'bg-[#181d26] text-white'
                                    : 'bg-[#e0e2e6] text-[#41454d]'
                            }`}
                        >
                            {sentCount}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Controls Bar: Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 w-full max-w-md">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9297a0]"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                            activeTab === 'received'
                                ? 'Search by title, description, or sharer...'
                                : 'Search by title, description, or collaborator...'
                        }
                        className="h-9 w-full rounded-[8px] border border-[#dddddd] bg-white pl-9 pr-3 !text-xs text-[#181d26] placeholder:text-[#9297a0] outline-none transition-colors hover:border-[#9297a0] focus:border-[#458fff]"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter Dropdown / Pills */}
                    <div className="flex items-center gap-1 rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-1">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'in-progress', label: 'In Progress' },
                            { id: 'completed', label: 'Completed' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setStatusFilter(s.id)}
                                className={`cursor-pointer rounded-[6px] px-2.5 py-1 !text-xs font-medium transition-colors ${
                                    statusFilter === s.id
                                        ? 'bg-white text-[#181d26] shadow-xs border border-[#dddddd]'
                                        : 'text-[#41454d] hover:text-[#181d26]'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Priority Selector */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="cursor-pointer h-8.5 rounded-[8px] border border-[#dddddd] bg-white px-2.5 !text-xs text-[#41454d] hover:border-[#9297a0] focus:border-[#458fff] outline-none"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-2 rounded-[8px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 !text-xs text-[#aa2d00]">
                    <AlertCircle size={15} />
                    <span>{typeof error === 'string' ? error : 'Failed to load shared tasks'}</span>
                </div>
            )}

            {/* Content Area */}
            {isLoading && rawItems.length === 0 ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-20 text-[#41454d]">
                    <Loader2 size={24} className="animate-spin text-[#181d26]" />
                    <p className="mt-2.5 !text-xs font-normal">Loading shared tasks...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                /* Clean Empty States */
                <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#dddddd] bg-white py-16 px-6 text-center shadow-xs">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#f8fafc] border border-[#dddddd] text-[#9297a0]">
                        {activeTab === 'received' ? <Inbox size={22} /> : <Share2 size={22} />}
                    </div>

                    <h3 className="mt-3.5 !text-sm font-semibold text-[#181d26]">
                        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'No matching shared tasks'
                            : activeTab === 'received'
                            ? 'No tasks shared with you yet'
                            : "You haven't shared any tasks with friends"}
                    </h3>

                    <p className="mt-1 max-w-sm !text-xs text-[#41454d] leading-relaxed">
                        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your search terms or filters.'
                            : activeTab === 'received'
                            ? 'When your accepted friends assign or share tasks with you, they will appear right here.'
                            : 'Pick any of your personal tasks and collaborate with friends in real-time.'}
                    </p>

                    {activeTab === 'sent' && !searchQuery && statusFilter === 'all' && (
                        <button
                            type="button"
                            onClick={() => setIsShareModalOpen(true)}
                            className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-[#181d26] px-4 py-2 !text-xs font-medium text-white hover:bg-[#0d1218] transition-colors shadow-xs cursor-pointer"
                        >
                            <Plus size={14} />
                            Share Your First Task
                        </button>
                    )}
                </div>
            ) : (
                /* Grid of Shared Task Cards */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((sharedTask) => {
                        const id = sharedTask._id
                        const isUpdating = updatingId === id
                        const isDeleting = deletingId === id

                        return (
                            <SharedTaskCard
                                key={id}
                                sharedTask={sharedTask}
                                type={activeTab}
                                onStatusChange={handleStatusChange}
                                onDelete={(item) => setTaskToUnshare(item)}
                                isUpdating={isUpdating}
                                isDeleting={isDeleting}
                            />
                        )
                    })}
                </div>
            )}

            {/* Share Task Modal */}
            <ShareTaskModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />

            {/* Unshare Confirmation Modal */}
            <UnshareConfirmModal
                isOpen={Boolean(taskToUnshare)}
                sharedTask={taskToUnshare}
                onClose={() => setTaskToUnshare(null)}
                onConfirm={handleConfirmUnshare}
                isDeleting={deletingId === taskToUnshare?._id}
            />
        </div>
    )
}
