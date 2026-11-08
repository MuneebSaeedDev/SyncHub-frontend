import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { signupUser, clearError } from '../../store/authSlice'
import BrandLogo from '../../components/common/BrandLogo'
import FormField from '../../components/common/FormField'
import GoogleSignInButton from '../../components/common/GoogleSignInButton'
import Button from '../../components/common/Button'

export default function Signup() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { isLoading, error: authError } = useSelector(
        (state) => state.auth
    )

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        dispatch(clearError())

        const { name, email, password, confirmPassword } = formData
        if (!name || !email || !password || !confirmPassword) {
            setErrors({ form: 'All fields are required.' })
            return
        }
        if (password.length < 8) {
            setErrors({ password: 'Password must be at least 8 characters.' })
            return
        }
        if (password !== confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match.' })
            return
        }
        setErrors({})
        try {
            const response = await dispatch(
                signupUser({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                })
            ).unwrap()

            navigate('/login', {
                replace: true,
                state: {
                    message: response.message || 'Account created successfully! Please sign in.',
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-10">

            <div className="w-full max-w-[390px] rounded-xl border border-gray-100 bg-white px-7 py-7 shadow-[0_4px_16px_rgba(15,23,42,0.08)]">

                {/* Logo */}
                <div className="mb-5 flex w-full justify-center">
                    <BrandLogo size="sm" className="gap-2" />
                </div>

                {/* Heading */}
                <div className="mb-6 text-center">
                    <h1 className="text-[24px] font-bold tracking-tight text-[#111a2e]">
                        Create your account
                    </h1>

                    <p className="mt-1 text-[13px] text-[#64748b]">
                        Start organizing your tasks with minimal friction.
                    </p>
                </div>

                {/* Backend Error */}
                {authError && (
                    <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                        {authError}
                    </div>
                )}

                {/* Signup Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    noValidate
                >

                    {/* Full Name */}
                    <FormField
                        label="Full name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Alex Morgan"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        icon={
                            <User
                                size={18}
                                className="text-[#64748b]"
                            />
                        }
                        required
                    />

                    {/* Email */}
                    <FormField
                        label="Email address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    {/* Password */}
                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        hint="Must be at least 8 characters."
                        isPassword
                        required
                    />

                    {/* Confirm Password */}
                    <FormField
                        label="Confirm password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        isPassword
                        required
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        fullWidth
                        isLoading={isLoading}
                        className="h-[38px] rounded-md text-[13px] font-semibold"
                    >
                        Create Account
                    </Button>

                    {/* Social Login Divider */}
                    <div className="flex w-full items-center gap-3 py-2">
                        <span className="h-px flex-1 bg-[#e9edff]" />

                        <span className="whitespace-nowrap text-[13px] font-normal text-[#64748b]">
                            or continue with
                        </span>

                        <span className="h-px flex-1 bg-[#e9edff]" />
                    </div>

                    {/* Google Sign In */}
                    <div className="w-full">
                        <GoogleSignInButton />
                    </div>

                </form>

                {/* Login Link */}
                <p className="mt-5 text-center text-[12px] text-[#64748b]">
                    Already have an account?{' '}

                    <Link
                        to="/login"
                        className="font-semibold text-[#5145ed] transition-colors hover:text-[#4338ca]"
                    >
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}