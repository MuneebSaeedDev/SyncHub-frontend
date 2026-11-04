import { Pencil, Eye, Trash2 } from 'lucide-react'

export default function TaskDropdown({
    onEdit,
    onView,
    onDelete,
}) {

    const items = [
        {
            label: 'Edit task',
            icon: Pencil,
            onClick: onEdit,
        },
        {
            label: 'View task',
            icon: Eye,
            onClick: onView,
        },
        {
            label: 'Delete task',
            icon: Trash2,
            onClick: onDelete,
            destructive: true,
        },
    ]

    return (
        <div className="w-[190px] rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">

            {items.map((item) => {

                const Icon = item.icon

                return (
                    <button
                        type="button"
                        key={item.label}
                        onClick={item.onClick}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-[11px] transition-colors
                            ${item.destructive
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-slate-700 hover:bg-slate-100'
                            }
                        `}
                    >
                        <Icon size={14} strokeWidth={1.7} />
                        {item.label}
                    </button>
                )
            })}

        </div>
    )
}
