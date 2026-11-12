import { Loader2 } from 'lucide-react'
import { getUserInitials } from '../../utils/userUtils'

// Relative time formatting helper
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Received recently'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Received recently'

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Received just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `Received ${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Received ${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Received yesterday'
    if (diffInDays < 7) return `Received ${diffInDays} days ago`

    return `Received on ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })}`
}

export default function FriendRequestCard({
    request,
    onAccept,
    onDecline,
    isLoading = false,
}) {
    const requester = request?.requester || {}
    const name = requester.name || 'Anonymous User'
    const email = requester.email || ''
    const initials = getUserInitials(name)
    const timeAgo = formatRelativeTime(request.createdAt)

    return (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#f8fafc]">
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#dddddd] bg-[#f8fafc] !text-xs !font-medium !text-[#181d26]">
                    {initials}
                </div>

                <div className="min-w-0">
                    <h3 className="!truncate !text-xs !font-medium !text-[#181d26] !leading-tight">
                        {name}
                    </h3>
                    <p className="!truncate !text-[11px] !text-[#41454d] mt-0.5">
                        {email}
                    </p>
                    <div className="flex items-center gap-1.5 !text-[10px] !text-[#41454d] mt-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9297a0]" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onDecline}
                    className="cursor-pointer rounded-[6px] border border-[#dddddd] bg-white px-3 py-1.5 !text-xs !font-normal !text-[#41454d] transition-colors hover:border-[#9297a0] hover:bg-[#f8fafc] hover:!text-[#181d26] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Decline
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onAccept}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] bg-[#181d26] px-3.5 py-1.5 !text-xs !font-medium !text-white transition-colors hover:bg-[#0d1218] active:bg-[#0d1218] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && (
                        <Loader2 size={12} className="animate-spin" />
                    )}
                    <span>Accept</span>
                </button>
            </div>
        </div>
    )
}
