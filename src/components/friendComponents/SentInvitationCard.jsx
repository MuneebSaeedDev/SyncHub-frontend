import React from 'react'
import { Loader2, X } from 'lucide-react'
import { getUserInitials } from '../../utils/userUtils'

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
    const diffInHours = Math.floor(diffInSeconds / 60)
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
    const timeAgo = formatRelativeTime(request.createdAt)

    return (
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#f8fafc]">
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#dddddd] bg-[#f8fafc] text-xs font-medium text-[#181d26]">
                    {initials}
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-xs font-medium text-[#181d26] leading-tight">
                            {name}
                        </h3>
                        <span className="inline-flex items-center rounded-[4px] bg-[#d9a441]/15 border border-[#d9a441]/35 px-1.5 py-0.5 text-[10px] font-medium text-[#91650c]">
                            Pending
                        </span>
                    </div>

                    <p className="truncate text-[11px] text-[#41454d] mt-0.5">
                        {email}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-[#41454d] mt-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9297a0]" />
                        <span>{timeAgo}</span>
                    </div>
                </div>
            </div>

            {/* Right: Cancel Invitation Button */}
            <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={onCancel}
                    className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-[#dddddd] bg-white px-3 py-1.5 text-xs font-normal text-[#aa2d00] transition-colors hover:border-[#aa2d00]/30 hover:bg-[#aa2d00]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Cancelling...</span>
                        </>
                    ) : (
                        <>
                            <X size={12} />
                            <span>Cancel Invitation</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
