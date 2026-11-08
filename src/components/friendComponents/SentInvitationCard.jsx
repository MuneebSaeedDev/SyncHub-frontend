import React from 'react'
import { Loader2, X } from 'lucide-react'
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

// Relative time formatting helper
const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Sent recently'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Sent recently'

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Sent just now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `Sent ${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Sent ${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return 'Sent yesterday'
    if (diffInDays < 7) return `Sent ${diffInDays} days ago`

    return `Sent on ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })}`
}

export default function SentInvitationCard({
    request,
    onCancel,
    isLoading = false,
}) {
    const recipient = request?.recipient || {}
    const name = recipient.name || 'Anonymous User'
    const email = recipient.email || ''
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
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-900 leading-tight">
                            {name}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Pending
                        </span>
                    </div>

                    <p className="truncate text-xs text-slate-400 mt-0.5">
                        {email}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <span className="inline-block h-2 w-2 rounded-full border border-slate-300" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Right: Cancel Invitation Button */}
            <div className="flex items-center gap-2.5 self-end sm:self-center">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onCancel}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs transition-colors hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Cancelling...</span>
                        </>
                    ) : (
                        <>
                            <X size={13} />
                            <span>Cancel Invitation</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
