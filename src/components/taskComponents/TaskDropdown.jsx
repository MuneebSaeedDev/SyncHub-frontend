import { Pencil, Eye, Trash2, Share2 } from 'lucide-react'

export default function TaskDropdown({
    onEdit,
    onView,
    onShare,
    onDelete,
}) {

    const items = [
        ...(onShare
            ? [
                  {
                      label: 'Share task',
                      icon: Share2,
                      onClick: onShare,
                  },
              ]
            : []),
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
        <div className="w-[180px] rounded-[10px] border border-[#dddddd] bg-white p-1 shadow-xl">

            {items.map((item) => {

                const Icon = item.icon

                return (
                    <button
                        type="button"
                        key={item.label}
                        onClick={item.onClick}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-1.5 !text-left !text-xs !font-normal transition-colors
                            ${item.destructive
                                ? '!text-[#aa2d00] hover:bg-[#aa2d00]/10'
                                : '!text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26]'
                            }
                        `}
                    >
                        <Icon size={14} strokeWidth={1.5} />
                        {item.label}
                    </button>
                )
            })}

        </div>
    )
}
