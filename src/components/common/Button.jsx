import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  onClick,
  ...restProps
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition duration-150 ease-in-out cursor-pointer select-none rounded-lg focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]'

  const variantStyles = {
    primary:
      'bg-[#5145ed] text-white hover:bg-[#4338ca] focus:ring-[#5145ed]/20 shadow-sm',
    secondary:
      'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-100 shadow-xs',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-100',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/20 shadow-sm',
  }

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs gap-1.5',
    md: 'h-12 px-4 text-sm gap-2',
    lg: 'h-13 px-6 text-base gap-2.5',
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
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
