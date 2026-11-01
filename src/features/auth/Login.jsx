import { useState } from 'react'
import BrandLogo from '../../components/BrandLogo'
import FormField from '../../components/FormField'
import Button from '../../components/common/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  function validate() {
    const newErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setAuthError(null)
    setSuccessMessage(null)

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSuccessMessage('Logged in successfully!')
    } catch {
      setAuthError('Authentication failed. Please verify your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 py-12">
      <section className="w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-7 shadow-xs sm:p-9">
        <BrandLogo />

        <header className="mb-7 mt-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your account.
          </p>
        </header>

        {authError && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            {authError}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <FormField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
            }}
            placeholder="you@example.com"
            error={errors.email}
            required
          />

          {/* Password */}
          <FormField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: null }))
            }}
            placeholder="Enter your password"
            error={errors.password}
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
            labelAction={
              <button
                type="button"
                className="cursor-pointer text-sm font-medium text-[#5145ed] transition hover:text-[#4035cc]"
                onClick={() => alert('Password reset link sent to your email.')}
              >
                Forgot password?
              </button>
            }
            required
          />

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3.5 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="shrink-0">or continue with</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => {
            setEmail('user@synchub.io')
            setPassword('password123')
          }}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.99]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 48 48"
            className="size-5 shrink-0"
          >
            <path
              fill="#FFC107"
              d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4.1 6v5h6.6c3.9-3.6 6.1-8.7 6.1-14.7Z"
            />
            <path
              fill="#FF3D00"
              d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"
            />
            <path
              fill="#4CAF50"
              d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z"
            />
            <path
              fill="#1976D2"
              d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.2C14.2 15.6 18.7 12 24 12Z"
            />
          </svg>
          Continue with Google
        </button>
      </section>
    </main>
  )
}
