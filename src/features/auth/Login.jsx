import { useState, useEffect } from 'react'

import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'

import { loginUser, clearError, } from '../../store/authSlice'

import BrandLogo from '../../components/common/BrandLogo'
import FormField from '../../components/common/FormField'
import Button from '../../components/common/Button'
import GoogleSignInButton from '../../components/GoogleSignInButton'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, error: authError } = useSelector(
    (state) => state.auth
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // Clear previous authentication errors
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Validate form
  function validate() {
    const newErrors = {}

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // Handle login
  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) return

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password,
        })
      ).unwrap()

      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })


    } catch (error) {
      // Error is already stored in Redux.
      console.error('Login failed:', error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 py-12">

      <section className="w-full max-w-[420px] rounded-2xl border border-gray-100 bg-white p-7 shadow-xs sm:p-9">

        {/* Logo */}
        <div className="flex w-full justify-center">
          <BrandLogo />
        </div>

        {/* Heading */}
        <header className="mb-7 mt-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your account.
          </p>
        </header>

        {/* Signup success message */}
        {location.state?.message && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-700">
            {location.state.message}
          </div>
        )}

        {/* Backend error */}
        {authError && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            {authError}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >

          {/* Email */}
          <FormField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)

              if (errors.email) {
                setErrors((prev) => ({
                  ...prev,
                  email: null,
                }))
              }
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
            onChange={(event) => {
              setPassword(event.target.value)

              if (errors.password) {
                setErrors((prev) => ({
                  ...prev,
                  password: null,
                }))
              }
            }}
            placeholder="Enter your password"
            error={errors.password}
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => {
              setShowPassword((prev) => !prev)
            }}
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

          {/* Social Login Divider */}
          <div className="flex items-center gap-4 pt-3 pb-1">
            <div className="h-px flex-1 bg-[#e9edff]" />

            <span className="shrink-0 text-sm text-slate-500">
              or continue with
            </span>

            <div className="h-px flex-1 bg-[#e9edff]" />
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton />

        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}

          <Link
            to="/signup"
            className="font-medium text-[#5145ed] transition hover:text-[#4035cc]"
          >
            Sign up
          </Link>
        </p>

      </section>
    </main>
  )
}