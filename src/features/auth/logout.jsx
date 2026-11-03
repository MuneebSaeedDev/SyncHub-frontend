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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoggingOut}
                    className="cursor-pointer absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    aria-label="Close logout dialog"
                >
                    <X size={18} />
                </button>

                {/* Top Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/50">
                    <LogOut size={22} />
                </div>

                {/* Header & Subtitle */}
                <h2 className="text-lg font-bold text-slate-900">
                    Sign out of SyncHub?
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    You will need to re-enter your credentials to access your personal tasks and friends.
                </p>

                {/* User Profile Card */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 text-sm">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AM'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                            {user?.name || 'Alex Morgan'}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {user?.email || 'alex@example.com'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoggingOut}
                        className="cursor-pointer rounded-xl border border-slate-200 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Logout