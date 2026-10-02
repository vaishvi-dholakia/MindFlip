import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Import all pages
import Landing from './pages/Landing'
import Register from './pages/Register'
import Login from './pages/Login'
import ProfileSetup from './pages/ProfileSetup'
import Dashboard from './pages/Dashboard'
import DebateSetup from './pages/DebateSetup'
import DebateArena from './pages/DebateArena'
import DebateReport from './pages/DebateReport'
import DebateHistory from './pages/DebateHistory'
import Settings from './pages/Settings'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/debate/setup" element={<ProtectedRoute><DebateSetup /></ProtectedRoute>} />
        <Route path="/debate/:id" element={<ProtectedRoute><DebateArena /></ProtectedRoute>} />
        <Route path="/debate/:id/report" element={<ProtectedRoute><DebateReport /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><DebateHistory /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
