import { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, ArrowRight, Loader2, AlertCircle, UserCheck } from 'lucide-react'
import { fetchFriends, fetchFriendRequests, deleteFriend } from '../../store/friendSlice'
import { getUserInitials } from '../../utils/userUtils'
import ConnectFriendModal from '../../components/friendComponents/ConnectFriendModal'

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
        <div className="mx-auto max-w-7xl space-y-6 pb-12 text-[#181d26]">
            {/* Top Breadcrumb & Title Section */}
            <div>
                <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-[#181d26]">
                            Friends
                        </h1>
                        <p className="mt-0.5 text-xs text-[#41454d]">
                            {friends.length} connected {friends.length === 1 ? 'friend' : 'friends'} in your network
                        </p>
                    </div>

                    {/* Connect Friend Primary Action Button */}
                    <button
                        type="button"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] bg-[#181d26] px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-[#0d1218] active:bg-[#0d1218]"
                    >
                        <UserPlus size={14} />
                        Connect Friend
                    </button>
                </div>
            </div>

            {/* Search Bar & View Pending Requests Link */}
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md">
                    <Search
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9297a0]"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search friends by name or email..."
                        className="h-9 w-full rounded-[8px] border border-[#dddddd] bg-white pl-9 pr-3.5 text-xs text-[#181d26] placeholder:text-[#9297a0] outline-none transition-colors hover:border-[#9297a0] focus:border-[#458fff]"
                    />
                </div>

                {/* View Pending Requests CTA */}
                <button
                    type="button"
                    onClick={() => navigate('/friend-requests')}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#1b61c9] transition-colors hover:text-[#1a3866] self-start sm:self-auto"
                >
                    <span>View Pending Requests ({pendingRequestsCount})</span>
                    <ArrowRight size={13} />
                </button>
            </div>

            {/* Error Message */}
            {status === 'failed' && error && (
                <div className="flex items-center gap-2 rounded-[8px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3.5 text-xs font-normal text-[#aa2d00]">
                    <AlertCircle size={15} />
                    <span>{typeof error === 'string' ? error : error?.message || 'Error loading friends'}</span>
                </div>
            )}

            {/* Loading Skeleton / Spinner */}
            {status === 'loading' && friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#41454d]">
                    <Loader2 size={24} className="animate-spin text-[#181d26]" />
                    <p className="mt-2 text-xs font-normal">Loading your network...</p>
                </div>
            ) : (
                /* Friends Grid */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Render existing friends */}
                    {filteredFriends.map((friend) => {
                        const id = friend._id || friend.id
                        const initials = getUserInitials(friend.name || 'Friend')
                        const isDeleting = deletingId === id

                        return (
                            <div
                                key={id}
                                className="flex flex-col justify-between rounded-[12px] border border-[#dddddd] bg-white p-5 shadow-xs transition-colors hover:border-[#9297a0]"
                            >
                                {/* Top: Avatar + Status Pill */}
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#dddddd] bg-[#f8fafc] text-xs font-medium text-[#181d26]">
                                        {initials}
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#006400]/10 border border-[#39bf45]/30 px-2 py-0.5 text-[10px] font-medium text-[#006400]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#006400]" />
                                        Connected
                                    </div>
                                </div>

                                {/* Friend Name & Email */}
                                <div className="mt-4">
                                    <h3 className="truncate text-xs font-medium text-[#181d26]">
                                        {friend.name || 'Anonymous User'}
                                    </h3>
                                    <p className="truncate text-[11px] text-[#41454d] mt-0.5">
                                        {friend.email}
                                    </p>
                                </div>

                                {/* Card Footer: Since Date & Remove Button */}
                                <div className="mt-5 flex items-center justify-between border-t border-[#dddddd] pt-3.5">
                                    <span className="text-[11px] text-[#41454d]">
                                        {formatFriendsSince(friend.createdAt)}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => setFriendToRemove(friend)}
                                        className="cursor-pointer rounded-[6px] border border-[#dddddd] bg-white px-3 py-1.5 text-[11px] font-normal text-[#41454d] transition-colors hover:border-[#9297a0] hover:bg-[#f8fafc] hover:text-[#181d26] disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <span className="flex items-center gap-1">
                                                <Loader2 size={11} className="animate-spin" />
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

                    {/* Dashed "Connect another friend" Card */}
                    <button
                        type="button"
                        onClick={() => setIsConnectModalOpen(true)}
                        className="group flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#dddddd] bg-[#f8fafc] p-6 text-center transition-colors hover:border-[#181d26] hover:bg-white shadow-xs"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-white border border-[#dddddd] text-[#41454d] group-hover:text-[#181d26] transition-colors">
                            <UserPlus size={18} />
                        </div>
                        <h4 className="mt-3 text-xs font-medium text-[#181d26]">
                            Connect another friend
                        </h4>
                        <p className="mt-0.5 text-[11px] text-[#41454d]">
                            Send a request via email
                        </p>
                    </button>
                </div>
            )}

            {/* Empty state when searching and no results */}
            {status !== 'loading' && friends.length > 0 && filteredFriends.length === 0 && (
                <div className="py-12 text-center text-xs text-[#41454d]">
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#181d26]/40 p-4 backdrop-blur-xs transition-opacity animate-fadeIn"
                    onClick={() => setFriendToRemove(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-[12px] border border-[#dddddd] bg-white p-6 shadow-xl transition-all text-[#181d26]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#aa2d00]/10 text-[#aa2d00] border border-[#aa2d00]/25">
                            <UserCheck size={16} />
                        </div>

                        <h3 className="mt-3.5 text-sm font-semibold text-[#181d26]">
                            Remove Friend?
                        </h3>
                        <p className="mt-1 text-xs text-[#41454d] leading-relaxed">
                            Are you sure you want to remove <span className="font-medium text-[#181d26]">{friendToRemove.name}</span> from your friends list? You won't be able to assign tasks together until you reconnect.
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setFriendToRemove(null)}
                                className="cursor-pointer rounded-[8px] border border-[#dddddd] bg-white px-3.5 py-2 text-xs font-medium text-[#181d26] hover:bg-[#f8fafc] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmRemove}
                                className="cursor-pointer rounded-[8px] bg-[#aa2d00] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#8f2500] transition-colors shadow-xs"
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
