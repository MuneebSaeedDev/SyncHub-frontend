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
      return <Mail size={18} className="shrink-0 text-gray-400" />
    }
    if (isPasswordField) {
      return <Lock size={18} className="shrink-0 text-gray-400" />
    }
    return null
  }

  const fieldIcon = renderIcon()

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <label
              htmlFor={inputId}
              className="font-medium text-gray-700 select-none"
            >
              {label}
              {required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          )}
          {labelAction}
        </div>
      )}

      <div
        className={`relative flex h-12 w-full items-center rounded-lg border bg-white px-3.5 transition ${
          error
            ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/15'
            : 'border-gray-300 focus-within:border-[#5145ed] focus-within:ring-2 focus-within:ring-[#5145ed]/15'
        } ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
      >
        {fieldIcon && <span className="mr-3 flex items-center">{fieldIcon}</span>}

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
          className={`h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed ${inputClassName}`}
          {...restProps}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={handleTogglePassword}
            tabIndex={-1}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="cursor-pointer ml-2 grid size-8 place-items-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600 animate-fadeIn">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}
