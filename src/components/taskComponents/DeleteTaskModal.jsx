import { Trash2, X, Loader2 } from 'lucide-react'

export default function DeleteTaskModal({
    isOpen,
    task,
    onClose,
    onConfirm,
    isDeleting = false,
}) {
    if (!isOpen || !task) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[500px] rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Trash Icon + Title + Close Button */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={20} strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                            Delete Task?
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                    “{task.title}” will be permanently deleted. This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting && (
                            <Loader2 size={16} className="animate-spin" />
                        )}
                        Delete Task
                    </button>
                </div>
            </div>
        </div>
    )
}
