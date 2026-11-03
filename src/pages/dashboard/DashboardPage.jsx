
import { useState } from 'react'
import Logout from '../../features/auth/logout.jsx'

function DashboardPage() {
  const [showLogout, setShowLogout] = useState(false)

  return (
    <>
      <div>
        <h1>Dashboard</h1>

        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          Log Out
        </button>
      </div>

      <Logout
        open={showLogout}
        onClose={() => setShowLogout(false)}
      />
    </>
  )
}

export default DashboardPage
