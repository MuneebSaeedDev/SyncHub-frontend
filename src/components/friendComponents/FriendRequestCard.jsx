import React from 'react'
import { Loader2 } from 'lucide-react'
import { getUserInitials } from '../../utils/userUtils'

// Avatar background colors matched to design
const AVATAR_COLORS = [
    { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-rose-50', text: 'text-rose-600' },
    { bg: 'bg-amber-50', text: 'text-amber-600' },
]

const getAvatarStyle = (str = '') => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length
    return AVATAR_COLORS[index]
}

// Relative time formatting helper (e.g. "Received 2 hours ago", "Received yesterday")
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
    const avatarStyle = getAvatarStyle(name || email)
    const timeAgo = formatRelativeTime(request.createdAt)

    return (
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-slate-50/50">
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-3.5 min-w-0">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-wider ${avatarStyle.bg} ${avatarStyle.text}`}
                >
                    {initials}
                </div>

                <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900 leading-tight">
                        {name}
                    </h3>
                    <p className="truncate text-xs text-slate-400 mt-0.5">
                        {email}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span className="inline-block h-2 w-2 rounded-full border border-slate-300" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 self-end sm:self-center">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onDecline}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Decline
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onAccept}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && (
                        <Loader2 size={13} className="animate-spin" />
                    )}
                    <span>Accept</span>
                </button>
            </div>
        </div>
    )
}
