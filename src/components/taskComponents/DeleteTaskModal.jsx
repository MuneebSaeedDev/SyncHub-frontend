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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[500px] rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Trash Icon + Title/Subtitle + Close Button */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={22} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Delete Task?
                            </h3>
                            <p className="text-sm font-medium text-red-600">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Main Descriptive Question */}
                <p className="mt-5 text-sm text-slate-500 leading-relaxed">
                    Are you sure you want to permanently delete this task from your workspace?
                </p>

                {/* Task Preview Card with Interactive Clickable Checkbox */}
                <div 
                    onClick={() => !isDeleting && setIsChecked(!isChecked)}
                    className="mt-3 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                                isChecked 
                                    ? 'bg-red-600 border-red-600 text-white' 
                                    : 'border-slate-300 bg-white hover:border-slate-400'
                            }`}
                        >
                            {isChecked && (
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                            {task.title}
                        </span>
                    </div>
                    {task.priority && (
                        <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                            {task.priority}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isDeleting || !isChecked}
                        className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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