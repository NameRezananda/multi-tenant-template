import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import SuperadminDashboard from './pages/SuperadminDashboard'
import TenantDashboard from './pages/TenantDashboard'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/:tenantDomain/login" element={<PageTransition><LoginPage /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute><PageTransition><SuperadminDashboard /></PageTransition></ProtectedRoute>
        } />
        <Route path="/superadmin/:tab" element={
          <ProtectedRoute><PageTransition><SuperadminDashboard /></PageTransition></ProtectedRoute>
        } />
        <Route path="/:tenantDomain" element={
          <ProtectedRoute><PageTransition><TenantDashboard /></PageTransition></ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
