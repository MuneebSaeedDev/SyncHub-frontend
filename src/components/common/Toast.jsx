import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { clearToast } from '../../store/sharedTaskSlice'

export default function Toast() {
    const dispatch = useDispatch()
    const toast = useSelector((state) => state.sharedTasks?.toast)

    useEffect(() => {
        if (!toast) return
        const timer = setTimeout(() => {
            dispatch(clearToast())
        }, 3800)
        return () => clearTimeout(timer)
    }, [toast, dispatch])

    if (!toast) return null

    const isSuccess = toast.type === 'success'
    const isError = toast.type === 'error'

    return (
        <div className="fixed bottom-5 right-5 z-[2000] flex max-w-sm items-center gap-2.5 rounded-[10px] border border-[#dddddd] bg-white p-3.5 shadow-xl transition-all animate-fadeIn !text-[#181d26]">
            {isSuccess && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#006400]/10 !text-[#006400] border border-[#39bf45]/30">
                    <CheckCircle2 size={16} />
                </div>
            )}
            {isError && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#aa2d00]/10 !text-[#aa2d00] border border-[#aa2d00]/25">
                    <AlertCircle size={16} />
                </div>
            )}
            {!isSuccess && !isError && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#f8fafc] !text-[#181d26] border border-[#dddddd]">
                    <Info size={16} />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <p className="!text-xs !font-medium !text-[#181d26] !leading-tight">
                    {toast.message}
                </p>
            </div>

            <button
                type="button"
                onClick={() => dispatch(clearToast())}
                className="cursor-pointer rounded-[4px] p-1 !text-[#9297a0] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors"
                aria-label="Dismiss toast"
            >
                <X size={14} />
            </button>
        </div>
    )
}
