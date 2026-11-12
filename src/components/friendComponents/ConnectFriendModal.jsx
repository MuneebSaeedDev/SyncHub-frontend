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

    // Reset when modal closes or opens
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
            setEmail('')
        } catch {
            // Handled via sendError in Redux state
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 p-4 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-[460px] rounded-[12px] border border-[#dddddd] bg-white p-6 shadow-xl transition-all !text-[#181d26]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="!text-base !font-semibold !tracking-tight !text-[#181d26]">
                            Connect with a Friend
                        </h3>
                        <p className="mt-0.5 !text-xs !text-[#41454d]">
                            Send an invitation to connect on SyncHub.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={sendLoading}
                        className="cursor-pointer rounded-[6px] p-1.5 !text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26] transition-colors disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Success Banner if request was successfully sent */}
                {sendSuccess ? (
                    <div className="mt-5 rounded-[12px] border border-[#39bf45]/30 bg-[#006400]/10 p-5 !text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#006400]/20 !text-[#006400]">
                            <CheckCircle2 size={20} />
                        </div>
                        <h4 className="mt-2.5 !text-xs !font-semibold !text-[#181d26]">
                            Friend Request Sent
                        </h4>
                        <p className="mt-1 !text-xs !text-[#41454d] !leading-relaxed">
                            Your request has been delivered. Once they accept, they will appear in your network.
                        </p>
                        <div className="mt-4 flex justify-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => dispatch(resetSendState())}
                                className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-1.5 !text-xs !font-medium !text-[#181d26] hover:bg-[#f8fafc] transition-colors"
                            >
                                Send Another
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="cursor-pointer rounded-[8px] bg-[#181d26] px-3.5 py-1.5 !text-xs !font-medium !text-white hover:bg-[#0d1218] transition-colors shadow-xs"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form Section */
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        {/* Server or Local Error Message */}
                        {(sendError || localError) && (
                            <div className="flex items-center gap-2 rounded-[6px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 !text-xs !font-normal !text-[#aa2d00]">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{localError || sendError}</span>
                            </div>
                        )}

                        {/* Email Input Field */}
                        <div>
                            <label
                                htmlFor="friend-email-input"
                                className="block !text-xs !font-medium !text-[#181d26]"
                            >
                                Friend's Email Address <span className="!text-[#aa2d00]">*</span>
                            </label>

                            <div className="relative mt-1.5">
                                <Mail
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 !text-[#9297a0]"
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
                                    placeholder="e.g., alex@example.com"
                                    className="h-9 w-full rounded-[6px] border border-[#dddddd] bg-white pl-9 pr-3 !text-xs !text-[#181d26] placeholder:!text-[#9297a0] outline-none transition-colors hover:border-[#9297a0] focus:border-[#458fff]"
                                />
                            </div>

                            <p className="mt-1 !text-[11px] !text-[#41454d]">
                                The recipient must have an existing SyncHub account registered with this email.
                            </p>
                        </div>

                        {/* How connections work Info Card */}
                        <div className="rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3.5">
                            <div className="flex items-start gap-2.5">
                                <Info size={15} className="!text-[#181d26] mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="!text-xs !font-medium !text-[#181d26]">
                                        How connections work
                                    </h4>
                                    <p className="mt-0.5 !text-[11px] !text-[#41454d] !leading-relaxed">
                                        Once sent, your request will appear in your friend&apos;s &ldquo;Friend Requests&rdquo; inbox. They can accept or reject the request at any time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#dddddd]">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={sendLoading}
                                className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 !text-xs !font-medium !text-[#181d26] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={sendLoading || !email.trim()}
                                className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#181d26] px-3.5 py-2 !text-xs !font-medium !text-white transition-colors hover:bg-[#0d1218] active:bg-[#0d1218] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                            >
                                {sendLoading ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Request</span>
                                        <Send size={12} />
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
