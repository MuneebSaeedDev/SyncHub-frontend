import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  onClick,
  ...restProps
}) {
  const variantStyles = {
    primary:
      'bg-[#181d26] !text-white hover:bg-[#0d1218] active:bg-[#0d1218] focus:ring-2 focus:ring-[#181d26]/20 border border-transparent',
    secondary:
      'bg-white !text-[#181d26] hover:bg-[#f8fafc] border border-[#dddddd] focus:border-[#9297a0]',
    outline:
      'border border-[#dddddd] bg-white !text-[#181d26] hover:bg-[#f8fafc]',
    ghost:
      '!text-[#41454d] hover:bg-[#f8fafc] hover:!text-[#181d26]',
    danger:
      'bg-[#aa2d00] !text-white hover:bg-[#8f2500] border border-transparent',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[10px] !font-medium cursor-pointer select-none
        transition duration-150 ease-out
        focus:outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        active:scale-[0.98]

        h-9 px-3.5 !text-xs
        sm:h-9 sm:px-3.5 sm:!text-xs
        md:h-10 md:px-4 md:!text-sm

        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...restProps}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-3.5 animate-spin shrink-0 !text-current" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="size-3.5 shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}