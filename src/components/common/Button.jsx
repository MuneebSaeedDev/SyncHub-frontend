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
      'bg-[#5145ed] text-white hover:bg-[#4338ca] focus:ring-[#5145ed]/20 shadow-sm',
    secondary:
      'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium cursor-pointer select-none
        transition duration-150 ease-in-out
        focus:outline-none focus:ring-4
        disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-[0.99]

        h-9 px-3 text-xs
        sm:h-10 sm:px-3.5 sm:text-xs
        md:h-11 md:px-4 md:text-sm
        lg:h-12 lg:px-5 lg:text-sm

        ${variantStyles[variant] || variantStyles.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...restProps}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="size-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  )
}