import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'

import { logoutUser } from '../../store/authSlice'

function Logout({ open, onClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { isLoggingOut } = useSelector((state) => state.auth)

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoggingOut}
                    className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close logout dialog"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
                    <LogOut size={26} className="text-red-600" />
                </div>

                {/* Content */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sign out of SyncHub?
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Are you sure you want to log out of your account?
                    You will need to sign in again to access your account.
                </p>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoggingOut}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut size={16} />
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Logout
