import { useState } from 'react'
import { Trash2, X, Loader2 } from 'lucide-react'

export default function DeleteTaskModal({
    isOpen,
    task,
    onClose,
    onConfirm,
    isDeleting = false,
}) {
    const [isChecked, setIsChecked] = useState(false)

    if (!isOpen || !task) return null

    // Reset checkbox state when modal closes or opens
    const handleClose = () => {
        setIsChecked(false)
        onClose()
    }

    const handleConfirm = () => {
        if (isChecked) {
            onConfirm()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 p-4 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[460px] rounded-[12px] border border-[#dddddd] bg-white p-6 shadow-xl transition-all text-[#181d26]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Trash Icon + Title/Subtitle + Close Button */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/25">
                            <Trash2 size={16} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[#181d26]">
                                Delete Task
                            </h3>
                            <p className="text-xs text-[#aa2d00]">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#dddddd] text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Main Descriptive Question */}
                <p className="mt-4 text-xs text-[#41454d] leading-relaxed">
                    Are you sure you want to permanently delete this task from your workspace?
                </p>

                {/* Task Preview Card with Interactive Clickable Checkbox */}
                <div
                    onClick={() => !isDeleting && setIsChecked(!isChecked)}
                    className="mt-3.5 flex items-center justify-between rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3 cursor-pointer hover:border-[#9297a0] transition-colors"
                >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                                isChecked
                                    ? 'bg-[#aa2d00] border-[#aa2d00] text-white'
                                    : 'border-[#dddddd] bg-white hover:border-[#9297a0]'
                            }`}
                        >
                            {isChecked && (
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span className="text-xs font-medium text-[#181d26] truncate">
                            {task.title}
                        </span>
                    </div>
                    {task.priority && (
                        <span className="shrink-0 rounded-[4px] bg-[#aa2d00]/10 border border-[#aa2d00]/25 px-1.5 py-0.5 text-[10px] font-medium text-[#aa2d00] capitalize">
                            {task.priority}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isDeleting || !isChecked}
                        className="flex items-center gap-1.5 rounded-[8px] bg-[#aa2d00] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#8f2500] transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isDeleting && (
                            <Loader2 size={13} className="animate-spin" />
                        )}
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    )
}
