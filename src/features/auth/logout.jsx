import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'

import { logoutUser } from '../../store/authSlice'

function Logout({ open, onClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { isLoggingOut, user } = useSelector((state) => state.auth)

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap()
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            onClose()
            navigate('/login', { replace: true })
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl border border-[#dddddd] text-[#181d26]">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoggingOut}
                    className="cursor-pointer absolute right-4 top-4 rounded-[6px] p-1.5 text-[#41454d] hover:bg-[#f8fafc] hover:text-[#181d26] transition-colors"
                    aria-label="Close logout dialog"
                >
                    <X size={16} />
                </button>

                {/* Top Icon */}
                <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/20">
                    <LogOut size={16} />
                </div>

                {/* Header & Subtitle */}
                <h2 className="text-sm font-semibold text-[#181d26]">
                    Sign out of SyncHub?
                </h2>

                <p className="mt-1 text-xs text-[#41454d] leading-relaxed">
                    You will need to re-enter your credentials to access your personal tasks and friends.
                </p>

                {/* User Profile Card */}
                <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-[#dddddd] bg-[#f8fafc] p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-white border border-[#dddddd] font-medium text-[#181d26] text-xs">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AM'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#181d26]">
                            {user?.name || 'Alex Morgan'}
                        </p>
                        <p className="truncate text-[11px] text-[#41454d]">
                            {user?.email || 'alex@example.com'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoggingOut}
                        className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-[#aa2d00] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#8f2500] disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-xs"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Logout
