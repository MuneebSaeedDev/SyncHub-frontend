import { Share2 } from 'lucide-react'

export default function BrandLogo({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) {
  const sizeMap = {
    sm: {
      box: 'size-7 rounded-[8px]',
      icon: 16,
      text: 'text-lg',
    },
    md: {
      box: 'size-9 rounded-[10px]',
      icon: 22,
      text: 'text-[22px]',
    },
    lg: {
      box: 'size-11 rounded-[12px]',
      icon: 26,
      text: 'text-2xl',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`grid ${currentSize.box} place-items-center bg-[#5145ed] text-white shadow-sm transition hover:bg-[#4338ca]`}
      >
        <Share2 size={currentSize.icon} strokeWidth={2.8} />
      </div>

      {showText && (
        <span
          className={`${currentSize.text} font-semibold tracking-[-0.7px] text-[#111a2e]`}
        >
          SyncHub
        </span>
      )}
    </div>
  )
}
