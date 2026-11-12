import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    X,
    Share2,
    Search,
    ChevronDown,
    Check,
    Loader2,
    AlertCircle,
    Users,
    Calendar,
    UserPlus,
} from 'lucide-react'
import { shareTask, resetShareState } from '../../store/sharedTaskSlice'
import { fetchFriends } from '../../store/friendSlice'
import { getUserInitials } from '../../utils/userUtils'
import ConnectFriendModal from '../friendComponents/ConnectFriendModal'

export default function ShareTaskModal({
    isOpen,
    onClose,
    preselectedTask = null,
}) {
    if (!isOpen) return null

    return (
        <ShareTaskModalDialog
            onClose={onClose}
            preselectedTask={preselectedTask}
        />
    )
}

function ShareTaskModalDialog({ onClose, preselectedTask = null }) {
    const dispatch = useDispatch()

    // Redux state
    const friends = useSelector((state) => state.friends?.list) || []
    const friendsStatus = useSelector((state) => state.friends?.status)
    const personalTasks = useSelector((state) => state.tasks?.tasks) || []
    const { isSharing, shareSuccess, shareError } = useSelector(
        (state) => state.sharedTasks
    )

    // Local form state
    const initialTaskId =
        preselectedTask?._id ||
        preselectedTask?.id ||
        (personalTasks[0]?._id || personalTasks[0]?.id || '')

    const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId)
    const [selectedFriendId, setSelectedFriendId] = useState('')
    const [status, setStatus] = useState('pending') // "pending" | "in-progress" | "completed"

    // Dropdown / combobox states
    const [isFriendDropdownOpen, setIsFriendDropdownOpen] = useState(false)
    const [friendSearch, setFriendSearch] = useState('')
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false)
    const [taskSearch, setTaskSearch] = useState('')

    // Connect friend modal toggle
    const [isConnectFriendModalOpen, setIsConnectFriendModalOpen] = useState(false)

    const friendDropdownRef = useRef(null)
    const taskDropdownRef = useRef(null)

    // Load friends if not yet loaded
    useEffect(() => {
        if (friendsStatus === 'idle') {
            dispatch(fetchFriends())
        }
    }, [friendsStatus, dispatch])

    const handleClose = useCallback(() => {
        dispatch(resetShareState())
        onClose?.()
    }, [dispatch, onClose])

    // Auto close on successful share
    useEffect(() => {
        if (shareSuccess) {
            handleClose()
        }
    }, [shareSuccess, handleClose])

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                friendDropdownRef.current &&
                !friendDropdownRef.current.contains(e.target)
            ) {
                setIsFriendDropdownOpen(false)
            }
            if (
                taskDropdownRef.current &&
                !taskDropdownRef.current.contains(e.target)
            ) {
                setIsTaskDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Determine current task object
    const activeTask =
        preselectedTask ||
        personalTasks.find(
            (t) => (t._id && t._id === selectedTaskId) || (t.id && t.id === selectedTaskId)
        )

    // Filtered friends
    const filteredFriends = friends.filter((f) => {
        const q = friendSearch.toLowerCase()
        return (
            f.name?.toLowerCase().includes(q) ||
            f.email?.toLowerCase().includes(q)
        )
    })

    // Filtered personal tasks (for task picker)
    const filteredPersonalTasks = personalTasks.filter((t) =>
        t.title?.toLowerCase().includes(taskSearch.toLowerCase())
    )

    const selectedFriend = friends.find(
        (f) => (f._id || f.id) === selectedFriendId
    )

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No due date'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedTaskId || !selectedFriendId || isSharing) return

        dispatch(
            shareTask({
                task_id: selectedTaskId,
                collaborator: selectedFriendId,
                status,
            })
        )
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 p-4 backdrop-blur-xs transition-opacity animate-fadeIn"
                onClick={handleClose}
            >
                <div
                    className="w-full max-w-[480px] rounded-[12px] border border-[#dddddd] bg-white p-6 shadow-xl transition-all !text-[#181d26]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#181d26] !text-white shadow-xs">
                                <Share2 size={16} />
                            </div>
                            <div>
                                <h3 className="!text-sm !font-semibold !text-[#181d26]">
                                    Share Task
                                </h3>
                                <p className="!text-xs !text-[#41454d]">
                                    Collaborate on this task with a connected friend.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSharing}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#dddddd] !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors cursor-pointer disabled:opacity-50"
                            aria-label="Close modal"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Server Error / Conflict Banner */}
                    {shareError && (
                        <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 !text-xs !text-[#aa2d00]">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{shareError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        {/* Task Summary / Selection */}
                        <div>
                            <label className="block !text-xs !font-medium !text-[#181d26] mb-1.5">
                                Task to Share <span className="!text-[#aa2d00]">*</span>
                            </label>

                            {preselectedTask ? (
                                /* Preselected Task Preview Card */
                                <div className="rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3.5 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="!text-xs !font-medium !text-[#181d26] !truncate">
                                            {activeTask?.title}
                                        </h4>
                                        {activeTask?.priority && (
                                            <span className="shrink-0 rounded-[4px] px-2 py-0.5 !text-[10px] !font-medium !capitalize bg-white border border-[#dddddd] !text-[#41454d]">
                                                {activeTask.priority}
                                            </span>
                                        )}
                                    </div>
                                    {activeTask?.description && (
                                        <p className="!text-[11px] !text-[#41454d] !line-clamp-2">
                                            {activeTask.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 !text-[11px] !text-[#41454d] pt-1">
                                        <Calendar size={12} className="!text-[#9297a0]" />
                                        <span>Due: {formatDate(activeTask?.dueDate)}</span>
                                    </div>
                                </div>
                            ) : personalTasks.length === 0 ? (
                                <div className="rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3 !text-center !text-xs !text-[#41454d]">
                                    No personal tasks found. Please create a task first.
                                </div>
                            ) : (
                                /* Task Selector Combobox */
                                <div className="relative" ref={taskDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsTaskDropdownOpen((prev) => !prev)
                                        }
                                        className="flex h-9 w-full items-center justify-between rounded-[8px] border border-[#dddddd] bg-white px-3 !text-xs !text-[#181d26] hover:border-[#9297a0] transition-colors cursor-pointer"
                                    >
                                        <span className="!truncate">
                                            {activeTask?.title || 'Select a task...'}
                                        </span>
                                        <ChevronDown size={14} className="!text-[#9297a0] shrink-0" />
                                    </button>

                                    {isTaskDropdownOpen && (
                                        <div className="absolute left-0 top-10 z-50 w-full rounded-[8px] border border-[#dddddd] bg-white shadow-xl overflow-hidden animate-fadeIn">
                                            <div className="p-2 border-b border-[#dddddd]">
                                                <div className="relative">
                                                    <Search
                                                        size={12}
                                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 !text-[#9297a0]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={taskSearch}
                                                        onChange={(e) =>
                                                            setTaskSearch(e.target.value)
                                                        }
                                                        placeholder="Search tasks..."
                                                        className="h-7 w-full rounded-[4px] border border-[#dddddd] bg-[#f8fafc] pl-7 pr-2 !text-xs !text-[#181d26] outline-none focus:border-[#458fff]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto divide-y divide-[#dddddd]">
                                                {filteredPersonalTasks.length === 0 ? (
                                                    <div className="p-3 !text-center !text-xs !text-[#41454d]">
                                                        No tasks match search
                                                    </div>
                                                ) : (
                                                    filteredPersonalTasks.map((t) => {
                                                        const id = t._id || t.id
                                                        const isSelected = selectedTaskId === id
                                                        return (
                                                            <button
                                                                key={id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedTaskId(id)
                                                                    setIsTaskDropdownOpen(false)
                                                                }}
                                                                className={`flex w-full items-center justify-between p-2.5 !text-left !text-xs transition-colors hover:bg-[#f8fafc] cursor-pointer ${
                                                                    isSelected
                                                                        ? 'bg-[#f8fafc] !font-medium !text-[#181d26]'
                                                                        : '!text-[#41454d]'
                                                                }`}
                                                            >
                                                                <span className="!truncate pr-2">
                                                                    {t.title}
                                                                </span>
                                                                {isSelected && (
                                                                    <Check
                                                                        size={14}
                                                                        className="!text-[#181d26] shrink-0"
                                                                    />
                                                                )}
                                                            </button>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Friend Selector */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block !text-xs !font-medium !text-[#181d26]">
                                    Collaborator (Accepted Friend) <span className="!text-[#aa2d00]">*</span>
                                </label>
                                <span className="!text-[11px] !text-[#41454d]">
                                    {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                                </span>
                            </div>

                            {friends.length === 0 ? (
                                /* Zero friends state: CTA to add friends */
                                <div className="rounded-[8px] border border-dashed border-[#dddddd] bg-[#f8fafc] p-4 !text-center">
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-[6px] bg-white border border-[#dddddd] !text-[#41454d]">
                                        <Users size={15} />
                                    </div>
                                    <h5 className="mt-2 !text-xs !font-medium !text-[#181d26]">
                                        No Accepted Friends Yet
                                    </h5>
                                    <p className="mt-0.5 !text-[11px] !text-[#41454d]">
                                        You must be accepted friends with someone on SyncHub before you can share tasks together.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsConnectFriendModalOpen(true)}
                                        className="mt-3 inline-flex items-center gap-1.5 rounded-[6px] border border-[#dddddd] bg-white px-3 py-1.5 !text-xs !font-medium !text-[#181d26] hover:bg-[#f8fafc] hover:border-[#9297a0] transition-colors cursor-pointer shadow-xs"
                                    >
                                        <UserPlus size={13} />
                                        Connect a Friend
                                    </button>
                                </div>
                            ) : (
                                /* Friend Combobox Dropdown */
                                <div className="relative" ref={friendDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsFriendDropdownOpen((prev) => !prev)
                                        }
                                        className="flex h-11 w-full items-center justify-between rounded-[8px] border border-[#dddddd] bg-white px-3 !text-xs !text-[#181d26] hover:border-[#9297a0] transition-colors cursor-pointer"
                                    >
                                        {selectedFriend ? (
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[#dddddd] bg-[#f8fafc] !text-[10px] !font-medium !text-[#181d26]">
                                                    {getUserInitials(selectedFriend.name)}
                                                </div>
                                                <div className="min-w-0 !text-left">
                                                    <p className="!text-xs !font-medium !text-[#181d26] !truncate">
                                                        {selectedFriend.name}
                                                    </p>
                                                    <p className="!text-[10px] !text-[#41454d] !truncate">
                                                        {selectedFriend.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="!text-[#9297a0]">
                                                Choose a friend to collaborate with...
                                            </span>
                                        )}
                                        <ChevronDown size={14} className="!text-[#9297a0] shrink-0 ml-2" />
                                    </button>

                                    {/* Combobox Panel */}
                                    {isFriendDropdownOpen && (
                                        <div className="absolute left-0 top-12 z-50 w-full rounded-[8px] border border-[#dddddd] bg-white shadow-xl overflow-hidden animate-fadeIn">
                                            {/* Search input inside dropdown */}
                                            <div className="p-2 border-b border-[#dddddd] bg-[#f8fafc]">
                                                <div className="relative">
                                                    <Search
                                                        size={13}
                                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 !text-[#9297a0]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={friendSearch}
                                                        onChange={(e) =>
                                                            setFriendSearch(e.target.value)
                                                        }
                                                        placeholder="Search by name or email..."
                                                        className="h-8 w-full rounded-[6px] border border-[#dddddd] bg-white pl-8 pr-2.5 !text-xs !text-[#181d26] outline-none placeholder:!text-[#9297a0] focus:border-[#458fff]"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            {/* Friends options */}
                                            <div className="max-h-52 overflow-y-auto divide-y divide-[#dddddd]">
                                                {filteredFriends.length === 0 ? (
                                                    <div className="p-4 !text-center !text-xs !text-[#41454d]">
                                                        No friends match "{friendSearch}"
                                                    </div>
                                                ) : (
                                                    filteredFriends.map((friend) => {
                                                        const id = friend._id || friend.id
                                                        const isSelected = selectedFriendId === id
                                                        return (
                                                            <div
                                                                key={id}
                                                                onClick={() => {
                                                                    setSelectedFriendId(id)
                                                                    setIsFriendDropdownOpen(false)
                                                                }}
                                                                className={`flex items-center justify-between p-2.5 hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                                                                    isSelected ? 'bg-[#f8fafc]' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[#dddddd] bg-white !text-[10px] !font-medium !text-[#181d26]">
                                                                        {getUserInitials(friend.name)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="!text-xs !font-medium !text-[#181d26] !truncate">
                                                                            {friend.name}
                                                                        </p>
                                                                        <p className="!text-[10px] !text-[#41454d] !truncate">
                                                                            {friend.email}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {isSelected && (
                                                                    <Check
                                                                        size={14}
                                                                        className="!text-[#181d26] shrink-0"
                                                                    />
                                                                )}
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Initial Status Selector */}
                        <div>
                            <label className="block !text-xs !font-medium !text-[#181d26] mb-1.5">
                                Initial Status
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        value: 'pending',
                                        label: 'Pending',
                                        badge: 'bg-[#d9a441]/15 !text-[#91650c] border-[#d9a441]/35',
                                        dot: 'bg-[#d9a441]',
                                    },
                                    {
                                        value: 'in-progress',
                                        label: 'In Progress',
                                        badge: 'bg-[#1b61c9]/10 !text-[#1b61c9] border-[#458fff]/30',
                                        dot: 'bg-[#1b61c9]',
                                    },
                                    {
                                        value: 'completed',
                                        label: 'Completed',
                                        badge: 'bg-[#006400]/10 !text-[#006400] border-[#39bf45]/30',
                                        dot: 'bg-[#006400]',
                                    },
                                ].map((item) => {
                                    const isSelected = status === item.value
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => setStatus(item.value)}
                                            className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-[8px] py-2 px-2 !text-xs !font-medium border transition-colors ${
                                                isSelected
                                                    ? 'border-[#181d26] bg-[#181d26] !text-white shadow-xs'
                                                    : 'border-[#dddddd] bg-white !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26]'
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    isSelected ? 'bg-white' : item.dot
                                                }`}
                                            />
                                            <span>{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#dddddd]">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSharing}
                                className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs !font-medium !text-[#181d26] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isSharing ||
                                    !selectedTaskId ||
                                    !selectedFriendId ||
                                    friends.length === 0
                                }
                                className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#181d26] px-4 py-2 !text-xs !font-medium !text-white transition-colors hover:bg-[#0d1218] active:bg-[#0d1218] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                            >
                                {isSharing ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Sharing Task...</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 size={13} />
                                        <span>Share Task</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Nested Connect Friend Modal if needed */}
            <ConnectFriendModal
                isOpen={isConnectFriendModalOpen}
                onClose={() => setIsConnectFriendModalOpen(false)}
            />
        </>
    )
}
