import { useState, useId } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function FormField({
  label,
  labelAction,
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  error,
  hint,
  icon,
  isPassword,
  showPassword: controlledShowPassword,
  onTogglePassword,
  className = '',
  inputClassName = '',
  ...restProps
}) {
  const generatedId = useId()
  const inputId = id || name || generatedId
  const [internalShowPassword, setInternalShowPassword] = useState(false)

  const isPasswordField = isPassword ?? type === 'password'
  const isPasswordVisible =
    controlledShowPassword !== undefined
      ? controlledShowPassword
      : internalShowPassword

  const handleTogglePassword = () => {
    if (onTogglePassword) {
      onTogglePassword()
    } else {
      setInternalShowPassword((prev) => !prev)
    }
  }

  const effectiveType = isPasswordField
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type

  // Select default icon if none provided
  const renderIcon = () => {
    if (icon) return icon
    if (type === 'email') {
      return <Mail size={16} className="shrink-0 !text-[#9297a0]" />
    }
    if (isPasswordField) {
      return <Lock size={16} className="shrink-0 !text-[#9297a0]" />
    }
    return null
  }

  const fieldIcon = renderIcon()

  return (
    <div className={`space-y-1.5 !text-left ${className}`}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between !text-xs">
          {label && (
            <label
              htmlFor={inputId}
              className="!font-medium !text-[#181d26] select-none"
            >
              {label}
              {required && <span className="ml-0.5 !text-[#aa2d00]">*</span>}
            </label>
          )}
          {labelAction}
        </div>
      )}

      <div
        className={`relative flex h-10 w-full items-center rounded-[6px] border bg-white px-3 transition ${
          error
            ? 'border-[#aa2d00] focus-within:border-[#aa2d00] focus-within:ring-2 focus-within:ring-[#aa2d00]/20'
            : 'border-[#dddddd] focus-within:border-[#458fff] focus-within:ring-2 focus-within:ring-[#458fff]/20 hover:border-[#9297a0]'
        } ${disabled ? 'opacity-40 cursor-not-allowed bg-[#f8fafc]' : ''}`}
      >
        {fieldIcon && <span className="mr-2.5 flex items-center">{fieldIcon}</span>}

        <input
          id={inputId}
          name={name}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`h-full min-w-0 flex-1 bg-transparent !text-sm !text-[#181d26] outline-none placeholder:!text-[#9297a0] disabled:cursor-not-allowed ${inputClassName}`}
          {...restProps}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={handleTogglePassword}
            tabIndex={-1}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="cursor-pointer ml-2 grid size-7 place-items-center rounded-[4px] !text-[#9297a0] transition hover:bg-[#f8fafc] hover:!text-[#181d26] focus:outline-none"
          >
            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="!text-xs !font-normal !text-[#aa2d00]">
          {error}
        </p>
      ) : hint ? (
        <p className="!text-xs !text-[#41454d]">{hint}</p>
      ) : null}
    </div>
  )
}
