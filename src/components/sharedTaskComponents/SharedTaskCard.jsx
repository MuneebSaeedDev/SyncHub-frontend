import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Check, Loader2, Trash2 } from 'lucide-react'
import { getUserInitials } from '../../utils/userUtils'

export default function SharedTaskCard({
    sharedTask,
    type = 'received', // 'received' | 'sent'
    onStatusChange,
    onDelete,
    isUpdating = false,
    isDeleting = false,
}) {
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsStatusDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const task = sharedTask?.task_id || {}
    const isReceived = type === 'received'
    const person = isReceived ? sharedTask?.shared_by : sharedTask?.collaborator
    const personLabel = isReceived ? 'Shared by' : 'Shared with'

    // Status options
    const statusOptions = [
        {
            value: 'pending',
            label: 'Pending',
            badgeBg: 'bg-[#d9a441]/15',
            badgeText: '!text-[#91650c]',
            badgeBorder: 'border-[#d9a441]/35',
            dot: 'bg-[#d9a441]',
        },
        {
            value: 'in-progress',
            label: 'In Progress',
            badgeBg: 'bg-[#1b61c9]/10',
            badgeText: '!text-[#1b61c9]',
            badgeBorder: 'border-[#458fff]/30',
            dot: 'bg-[#1b61c9]',
        },
        {
            value: 'completed',
            label: 'Completed',
            badgeBg: 'bg-[#006400]/10',
            badgeText: '!text-[#006400]',
            badgeBorder: 'border-[#39bf45]/30',
            dot: 'bg-[#006400]',
        },
    ]

    const currentStatusConfig =
        statusOptions.find((opt) => opt.value === sharedTask?.status) ||
        statusOptions[0]

    // Priority configuration
    const priority = (task?.priority || 'low').toLowerCase()
    const priorityConfig = {
        high: {
            badge: 'bg-[#aa2d00]/10 !text-[#aa2d00] border border-[#aa2d00]/25',
            dot: 'bg-[#aa2d00]',
        },
        medium: {
            badge: 'bg-[#d9a441]/15 !text-[#91650c] border border-[#d9a441]/35',
            dot: 'bg-[#d9a441]',
        },
        low: {
            badge: 'bg-[#f8fafc] !text-[#41454d] border border-[#dddddd]',
            dot: 'bg-[#9297a0]',
        },
    }
    const currentPriority = priorityConfig[priority] || priorityConfig.low

    // Date formatting helper
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

    const isOverdue = (() => {
        if (!task.dueDate) return false
        const d = new Date(task.dueDate)
        return d < new Date() && !isNaN(d.getTime()) && sharedTask?.status !== 'completed'
    })()

    const handleSelectStatus = (newStatus) => {
        setIsStatusDropdownOpen(false)
        if (newStatus !== sharedTask?.status) {
            onStatusChange?.(sharedTask._id, newStatus)
        }
    }

    return (
        <div className="flex flex-col justify-between rounded-[12px] border border-[#dddddd] bg-white p-5 shadow-xs transition-colors hover:border-[#9297a0] !text-[#181d26]">
            {/* Top Bar: Priority Badge, Due Date, and Unshare Button */}
            <div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Priority Badge */}
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 !text-[11px] !font-medium !capitalize ${currentPriority.badge}`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${currentPriority.dot}`} />
                            {priority}
                        </span>

                        {/* Due Date Badge */}
                        {task.dueDate && (
                            <span
                                className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-0.5 !text-[11px] !font-medium border ${
                                    isOverdue
                                        ? 'bg-[#aa2d00]/10 !text-[#aa2d00] border-[#aa2d00]/25'
                                        : 'bg-[#f8fafc] !text-[#41454d] border-[#dddddd]'
                                }`}
                            >
                                <Calendar size={12} className={isOverdue ? '!text-[#aa2d00]' : '!text-[#9297a0]'} />
                                <span>{formatDate(task.dueDate)}</span>
                                {isOverdue && <span className="!font-semibold">&middot; Overdue</span>}
                            </span>
                        )}
                    </div>

                    {/* Unshare / Delete Action Button */}
                    <button
                        type="button"
                        onClick={() => onDelete?.(sharedTask)}
                        disabled={isDeleting}
                        title="Unshare task"
                        aria-label="Unshare task"
                        className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-[6px] !text-[#9297a0] hover:bg-[#aa2d00]/10 hover:!text-[#aa2d00] border border-transparent hover:border-[#aa2d00]/25 transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <Loader2 size={13} className="animate-spin !text-[#aa2d00]" />
                        ) : (
                            <Trash2 size={14} />
                        )}
                    </button>
                </div>

                {/* Task Title & Description */}
                <div className="mt-3.5 space-y-1">
                    <h3 className="!text-sm !font-semibold !text-[#181d26] !leading-snug !line-clamp-1">
                        {task.title || 'Untitled Task'}
                    </h3>
                    <p className="!text-xs !text-[#41454d] !line-clamp-2 !leading-relaxed">
                        {task.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            {/* Bottom Meta & Interactive Status Control */}
            <div className="mt-5 space-y-3 border-t border-[#dddddd] pt-3.5">
                {/* Person Chip (Sharer or Collaborator) */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[#dddddd] bg-[#f8fafc] !text-[10px] !font-medium !text-[#181d26]">
                            {getUserInitials(person?.name || 'User')}
                        </div>
                        <div className="min-w-0">
                            <span className="block !text-[10px] !text-[#9297a0] !leading-none !uppercase !tracking-wider">
                                {personLabel}
                            </span>
                            <p className="!truncate !text-xs !font-medium !text-[#181d26] mt-0.5">
                                {person?.name || 'Unknown User'}
                            </p>
                        </div>
                    </div>

                    <span className="!text-[10px] !text-[#9297a0] !truncate shrink-0 hidden sm:inline">
                        {person?.email}
                    </span>
                </div>

                {/* Interactive Status Selector Bar */}
                <div className="flex items-center justify-between gap-2">
                    <span className="!text-[11px] !font-normal !text-[#41454d]">Status:</span>

                    {/* Dropdown Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                            disabled={isUpdating}
                            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 !text-xs !font-medium border transition-colors ${currentStatusConfig.badgeBg} ${currentStatusConfig.badgeText} ${currentStatusConfig.badgeBorder} hover:opacity-90 disabled:opacity-60`}
                        >
                            {isUpdating ? (
                                <Loader2 size={12} className="animate-spin text-current" />
                            ) : (
                                <span className={`h-1.5 w-1.5 rounded-full ${currentStatusConfig.dot}`} />
                            )}
                            <span>{currentStatusConfig.label}</span>
                            <ChevronDown size={12} className="opacity-70" />
                        </button>

                        {/* Status Options Menu */}
                        {isStatusDropdownOpen && (
                            <div className="absolute right-0 bottom-full mb-1.5 z-40 w-36 rounded-[8px] border border-[#dddddd] bg-white p-1 shadow-xl animate-fadeIn">
                                {statusOptions.map((opt) => {
                                    const isSelected = opt.value === sharedTask?.status
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleSelectStatus(opt.value)}
                                            className={`cursor-pointer flex w-full items-center justify-between rounded-[5px] px-2 py-1.5 !text-xs !text-left transition-colors ${
                                                isSelected
                                                    ? 'bg-[#f8fafc] !font-medium !text-[#181d26]'
                                                    : '!text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26]'
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
                                                <span>{opt.label}</span>
                                            </span>
                                            {isSelected && <Check size={13} className="!text-[#181d26]" />}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
