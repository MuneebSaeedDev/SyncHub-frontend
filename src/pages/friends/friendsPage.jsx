import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ArrowRight, Loader2, AlertCircle, UserCheck } from 'lucide-react'
import { fetchFriends, fetchFriendRequests, deleteFriend } from '../../store/friendSlice'
import { getUserInitials } from '../../utils/userUtils'
import ConnectFriendModal from '../../components/friendComponents/ConnectFriendModal'

// Helper for soft background colors based on initials / names (matches image design)
const AVATAR_COLORS = [
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-sky-100', text: 'text-sky-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
]

const getAvatarColor = (str = '') => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
}

// Format "Friends since [Month] [Year]"
const formatFriendsSince = (dateStr) => {
    if (!dateStr) return 'Friends since Oct 2026'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Friends since Oct 2026'
    return `Friends since ${date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    })}`
}

export default function FriendsPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // 1. Redux State Access
    const {
        list: friends = [],
        requests = [],
        status,
        error,
        deletingId,
    } = useSelector((state) => state.friends)

    // 2. Local State
    const [searchQuery, setSearchQuery] = useState('')
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
    const [friendToRemove, setFriendToRemove] = useState(null)

    // 3. Fetch data on mount if not already loaded
    useEffect(() => {
        dispatch(fetchFriends())
        dispatch(fetchFriendRequests())
    }, [dispatch])

    // 4. Remove Friend submission
    const handleConfirmRemove = async () => {
        if (!friendToRemove) return
        const id = friendToRemove._id || friendToRemove.id
        try {
            await dispatch(deleteFriend(id)).unwrap()
            setFriendToRemove(null)
        } catch (err) {
            console.error('Failed to remove friend:', err)
        }
    }

    // Filtered Friends search
    const filteredFriends = useMemo(() => {
        if (!searchQuery.trim()) return friends
        const q = searchQuery.toLowerCase()
        return friends.filter(
            (friend) =>
                friend.name?.toLowerCase().includes(q) ||
                friend.email?.toLowerCase().includes(q)
        )
    }, [friends, searchQuery])

    const pendingRequestsCount = requests?.length || 0

    return (
        <div className="mx-auto max-w-7xl space-y-6 pb-12">
            {/* Top Breadcrumb & Title Section */}
            <div>
                <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Friends
                        </h1>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {friends.length} connected {friends.length === 1 ? 'friend' : 'friends'} in your network
                        </p>
                    </div>

                    {/* Connect Friend Primary Action Button */}
                    <button
                        type="button"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
                    >
                        <UserPlus size={16} />
                        Connect Friend
                    </button>
                </div>
            </div>

            {/* Search Bar & View Pending Requests Link */}
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search friends by name or email..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                {/* View Pending Requests CTA */}
                <button
                    type="button"
                    onClick={() => navigate('/friend-requests')}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 self-start sm:self-auto"
                >
                    <span>View Pending Requests ({pendingRequestsCount})</span>
                    <ArrowRight size={14} />
                </button>
            </div>

            {/* Error Message */}
            {status === 'failed' && error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-600">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Loading Skeleton / Spinner */}
            {status === 'loading' && friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 size={28} className="animate-spin text-indigo-600" />
                    <p className="mt-2 text-xs font-medium">Loading your network...</p>
                </div>
            ) : (
                /* Friends Grid */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Render existing friends */}
                    {filteredFriends.map((friend) => {
                        const id = friend._id || friend.id
                        const initials = getUserInitials(friend.name || 'Friend')
                        const avatarStyle = getAvatarColor(friend.name || friend.email || 'friend')
                        const isDeleting = deletingId === id

                        return (
                            <div
                                key={id}
                                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs"
                            >
                                {/* Top: Avatar + Status Pill */}
                                <div className="flex items-start justify-between">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold ${avatarStyle.bg} ${avatarStyle.text}`}
                                    >
                                        {initials}
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Connected
                                    </div>
                                </div>

                                {/* Friend Name & Email */}
                                <div className="mt-4">
                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                        {friend.name || 'Anonymous User'}
                                    </h3>
                                    <p className="truncate text-xs text-slate-400">
                                        {friend.email}
                                    </p>
                                </div>

                                {/* Card Footer: Since Date & Remove Button */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="text-[11px] text-slate-400">
                                        {formatFriendsSince(friend.createdAt)}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => setFriendToRemove(friend)}
                                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 size={12} className="animate-spin" />
                                                Removing...
                                            </span>
                                        ) : (
                                            'Remove'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {/* Dashed "Connect another friend" Card (Matches Figma / screenshot) */}
                    <button
                        type="button"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="group flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-6 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/20"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105">
                            <UserPlus size={20} />
                        </div>
                        <h4 className="mt-3 text-xs font-bold text-slate-800">
                            Connect another friend
                        </h4>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                            Send a request via email
                        </p>
                    </button>
                </div>
            )}

            {/* Empty state when searching and no results */}
            {status !== 'loading' && friends.length > 0 && filteredFriends.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                    No friends found matching "{searchQuery}".
                </div>
            )}


            {/* Connect Friend Modal Component */}
            <ConnectFriendModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
            />

            {/* Remove Friend Confirmation Dialog */}
            {friendToRemove && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs transition-opacity"
                    onClick={() => setFriendToRemove(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <UserCheck size={20} />
                        </div>

                        <h3 className="mt-3.5 text-base font-bold text-slate-900">
                            Remove Friend?
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Are you sure you want to remove <span className="font-semibold text-slate-700">{friendToRemove.name}</span> from your friends list? You won't be able to assign tasks together until you reconnect.
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setFriendToRemove(null)}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRemove}
                                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                                Remove Friend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
