import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../store/authSlice'
import BrandLogo from '../../components/common/BrandLogo'
import FormField from '../../components/common/FormField'
import Button from '../../components/common/Button'
import GoogleSignInButton from '../../components/common/GoogleSignInButton'

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
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12">
      <section className="w-full max-w-[400px] rounded-[12px] border border-[#dddddd] bg-white p-7 shadow-xs sm:p-8">
        {/* Logo */}
        <div className="flex w-full justify-center">
          <BrandLogo />
        </div>

        {/* Heading */}
        <header className="mb-6 mt-6 !text-center">
          <h1 className="!text-xl !font-semibold !tracking-tight !text-[#181d26]">
            Welcome back
          </h1>

          <p className="mt-1 !text-xs !text-[#41454d]">
            Enter your credentials to access your account
          </p>
        </header>

        {/* Signup success message */}
        {location.state?.message && (
          <div className="mb-4 rounded-[6px] border border-[#39bf45]/40 bg-[#006400]/5 p-3 !text-xs !text-[#006400]">
            {location.state.message}
          </div>
        )}

        {/* Backend error */}
        {authError && (
          <div className="mb-4 rounded-[6px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 !text-xs !text-[#aa2d00]">
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
            placeholder="name@example.com"
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
          <div className="flex items-center gap-3 pt-3 pb-1">
            <div className="h-px flex-1 bg-[#dddddd]" />

            <span className="shrink-0 !text-xs !text-[#41454d]">
              or continue with
            </span>

            <div className="h-px flex-1 bg-[#dddddd]" />
          </div>

          {/* Google Sign In */}
          <GoogleSignInButton />
        </form>

        {/* Signup Link */}
        <p className="mt-6 !text-center !text-xs !text-[#41454d]">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="!font-medium !text-[#1b61c9] transition hover:!text-[#1a3866]"
          >
            Sign up
          </Link>
        </p>
      </section>
    </main>
  )
}
