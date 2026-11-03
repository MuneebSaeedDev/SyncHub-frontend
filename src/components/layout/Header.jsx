import { Search, Bell } from 'lucide-react'

export default function Header({
    title = 'Overview',
    searchValue = '',
    onSearch,
    onNotifications,
    onProfileClick,
    userInitial = 'U',
}) {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">

            <h2 className="text-sm font-semibold text-slate-900">
                {title}
            </h2>

            <div className="flex items-center gap-3">

                <div className="relative hidden sm:block">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder="Search..."
                        className="h-8 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-indigo-400"
                    />
                </div>

                <button
                    type="button"
                    onClick={onNotifications}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Notifications"
                >
                    <Bell size={17} />
                </button>

                <button
                    type="button"
                    onClick={onProfileClick}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
                    aria-label="User profile"
                >
                    {userInitial}
                </button>

            </div>
        </header>
    )
}