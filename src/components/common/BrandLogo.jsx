import { Share2 } from 'lucide-react'

export default function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) {
  const sizeMap = {
    sm: {
      box: 'size-7 rounded-[6px]',
      icon: 14,
      text: 'text-base',
    },
    md: {
      box: 'size-8 rounded-[8px]',
      icon: 16,
      text: 'text-lg',
    },
    lg: {
      box: 'size-10 rounded-[10px]',
      icon: 20,
      text: 'text-xl',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`grid ${currentSize.box} place-items-center bg-[#181d26] text-white shadow-xs transition hover:bg-[#0d1218]`}
      >
        <Share2 size={currentSize.icon} strokeWidth={2.2} />
      </div>

      {showText && (
        <span
          className={`${currentSize.text} font-medium tracking-tight text-[#181d26]`}
        >
          SyncHub
        </span>
      )}
    </div>
  )
}
