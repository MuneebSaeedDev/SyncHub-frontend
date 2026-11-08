import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { logoutUser } from '../../store/authSlice'
import Button from './Button'

export default function LogoutButton() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { isLoggingOut } = useSelector(
        (state) => state.auth
    )

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap()

            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
        >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
    )
}