import { GoogleLogin } from '@react-oauth/google'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { googleLoginUser } from '../store/authSlice'

export default function GoogleSignInButton() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()

    const handleGoogleSuccess = async (response) => {
        try {
            await dispatch(
                googleLoginUser(response.credential)
            ).unwrap()

            const from = location.state?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
        } catch (error) {
            console.error('Google Sign-In Error:', error)
        }
    }

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.error('Google Sign-In failed')
                }}
                text="continue_with"
                theme="outline"
                size="large"
                shape="rectangular"
                width="350"
            />
        </div>
    )
}
