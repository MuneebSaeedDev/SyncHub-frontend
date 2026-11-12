import { Trash2, X, Loader2 } from 'lucide-react'

export default function UnshareConfirmModal({
    isOpen,
    sharedTask,
    onClose,
    onConfirm,
    isDeleting = false,
}) {
    if (!isOpen || !sharedTask) return null

    const taskTitle = sharedTask.task_id?.title || 'Shared Task'
    const collaboratorName = sharedTask.collaborator?.name || 'collaborator'
    const sharerName = sharedTask.shared_by?.name || 'sharer'

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 p-4 backdrop-blur-xs transition-opacity animate-fadeIn !text-[#181d26]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[460px] rounded-[12px] border border-[#dddddd] bg-white p-6 shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#aa2d00]/10 !text-[#aa2d00] border border-[#aa2d00]/25">
                            <Trash2 size={16} strokeWidth={1.8} />
                        </div>
                        <div>
                            <h3 className="!text-sm !font-semibold !text-[#181d26]">
                                Remove Shared Task?
                            </h3>
                            <p className="!text-xs !text-[#aa2d00]">
                                Unshares task collaboration.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#dddddd] !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Close dialog"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Description */}
                <p className="mt-4 !text-xs !text-[#41454d] !leading-relaxed">
                    Are you sure you want to unshare <span className="!font-medium !text-[#181d26]">"{taskTitle}"</span>? Both you and your friend will no longer share progress on this task.
                </p>

                {/* Task Preview */}
                <div className="mt-3.5 rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3 !text-xs">
                    <p className="!font-medium !text-[#181d26] !truncate">
                        {taskTitle}
                    </p>
                    <p className="mt-1 !text-[11px] !text-[#41454d]">
                        Shared between: <span className="!font-medium !text-[#181d26]">{sharerName}</span> &rarr; <span className="!font-medium !text-[#181d26]">{collaboratorName}</span>
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs !font-medium !text-[#181d26] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="cursor-pointer flex items-center gap-1.5 rounded-[8px] bg-[#aa2d00] px-4 py-2 !text-xs !font-medium !text-white hover:bg-[#8f2500] transition-colors shadow-xs disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 size={13} className="animate-spin" />}
                        {isDeleting ? 'Removing...' : 'Remove Shared Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}
