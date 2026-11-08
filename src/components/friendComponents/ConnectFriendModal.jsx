import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Mail, Info, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { sendFriendRequest, resetSendState } from '../../store/friendSlice'

export default function ConnectFriendModal({ isOpen, onClose }) {
    const dispatch = useDispatch()
    const [email, setEmail] = useState('')
    const [localError, setLocalError] = useState('')

    const { sendLoading, sendSuccess, sendError } = useSelector(
        (state) => state.friends
    )

    // Modal band hone par ya khulne par form reset ho jaye
    useEffect(() => {
        if (!isOpen) {
            setEmail('')
            setLocalError('')
            dispatch(resetSendState())
        }
    }, [isOpen, dispatch])

    if (!isOpen) return null

    const handleClose = () => {
        setEmail('')
        setLocalError('')
        dispatch(resetSendState())
        onClose?.()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLocalError('')

        const trimmedEmail = email.trim()

        // Basic client-side email format validation
        if (!trimmedEmail) {
            setLocalError("Email address is required.")
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedEmail)) {
            setLocalError("Please enter a valid email address.")
            return
        }

        try {
            await dispatch(sendFriendRequest(trimmedEmail)).unwrap()
            // Success hone par input clear ho jayega
            setEmail('')
        } catch {
            // Error Redux state (sendError) se handle hota hai
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[480px] rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all sm:p-7"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">
                            Connect with a Friend
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Send an invitation to connect on SyncHub.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={sendLoading}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Success Banner if request was successfully sent */}
                {sendSuccess ? (
                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-emerald-900">
                            Friend Request Sent!
                        </h4>
                        <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                            Your request has been delivered. Once they accept, they will appear in your network.
                        </p>
                        <div className="mt-5 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => dispatch(resetSendState())}
                                className="cursor-pointer rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
                            >
                                Send Another
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form Section */
                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* Server or Local Error Message */}
                        {(sendError || localError) && (
                            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-600">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{localError || sendError}</span>
                            </div>
                        )}

                        {/* Email Input Field */}
                        <div>
                            <label
                                htmlFor="friend-email-input"
                                className="block text-[13px] font-semibold text-slate-900"
                            >
                                Friend's Email Address <span className="text-rose-500">*</span>
                            </label>

                            <div className="relative mt-2">
                                <Mail
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    id="friend-email-input"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (localError) setLocalError('')
                                        if (sendError) dispatch(resetSendState())
                                    }}
                                    placeholder="e.g., colleague@example.com"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs outline-none transition-all focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
                                />
                            </div>

                            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                                The recipient must have an existing SyncHub account registered with this email.
                            </p>
                        </div>

                        {/* How connections work Info Card */}
                        <div className="rounded-xl border border-indigo-100/70 bg-[#F8FAFF] p-4">
                            <div className="flex items-start gap-3">
                                <Info size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-[13px] font-bold text-slate-800">
                                        How connections work
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                        Once sent, your request will appear in your friend&apos;s &ldquo;Friend Requests&rdquo; inbox. They can accept or reject the request at any time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={sendLoading}
                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={sendLoading || !email.trim()}
                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sendLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Request</span>
                                        <Send size={15} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
