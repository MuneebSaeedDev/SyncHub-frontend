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
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
            <div className="w-full max-w-[400px] rounded-[12px] border border-[#dddddd] bg-white px-7 py-7 shadow-xs">
                {/* Logo */}
                <div className="mb-5 flex w-full justify-center">
                    <BrandLogo size="md" />
                </div>

                {/* Heading */}
                <div className="mb-6 text-center">
                    <h1 className="text-xl font-semibold tracking-tight text-[#181d26]">
                        Create your account
                    </h1>

                    <p className="mt-1 text-xs text-[#41454d]">
                        Start organizing your tasks with minimal friction
                    </p>
                </div>

                {/* General Form Error */}
                {errors.form && (
                    <div className="mb-4 rounded-[6px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 text-xs text-[#aa2d00]">
                        {errors.form}
                    </div>
                )}

                {/* Backend Error */}
                {authError && (
                    <div className="mb-4 rounded-[6px] border border-[#aa2d00]/30 bg-[#aa2d00]/10 p-3 text-xs text-[#aa2d00]">
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
                                size={16}
                                className="text-[#9297a0]"
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
                        placeholder="name@example.com"
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
                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Create Account
                        </Button>
                    </div>

                    {/* Social Login Divider */}
                    <div className="flex w-full items-center gap-3 py-2">
                        <span className="h-px flex-1 bg-[#dddddd]" />

                        <span className="whitespace-nowrap text-xs text-[#41454d]">
                            or continue with
                        </span>

                        <span className="h-px flex-1 bg-[#dddddd]" />
                    </div>

                    {/* Google Sign In */}
                    <div className="w-full">
                        <GoogleSignInButton />
                    </div>
                </form>

                {/* Login Link */}
                <p className="mt-5 text-center text-xs text-[#41454d]">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-[#1b61c9] transition-colors hover:text-[#1a3866]"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
