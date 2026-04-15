import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../axios'
import { Lock, Mail, Loader2, ShieldCheck, Building2 } from 'lucide-react'

export default function LoginPage() {
  const { tenantDomain } = useParams()
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await api.post('/login', { email, password })
      const user = res.data.user
      
      // If logging in through a specific tenant path, verify association
      if (tenantDomain) {
        const hasAccess = user.tenants?.some(t => t.domain === tenantDomain)
        if (!hasAccess && !user.is_superadmin) {
           setError(`You do not have permission to access the ${tenantDomain} workspace.`)
           setLoading(false)
           return
        }
      }

      localStorage.setItem('auth_token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Redirect based on role or context
      if (user.is_superadmin) {
        navigate('/superadmin')
      } else if (tenantDomain) {
        navigate(`/${tenantDomain}`)
      } else if (user.tenants?.length > 0) {
        navigate(`/${user.tenants[0].domain}`)
      } else {
        setError('Your account is not associated with any active workspace.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container flex-center">
      <div className="background-gradient"></div>
      
      <div className="glass-card max-w-md w-full p-8 animate-fade-up">
        <div className="text-center mb-8">
          {tenantDomain ? (
            <div className="flex-center flex-col gap-2">
              <Building2 size={40} className="text-accent mb-2" />
              <div className="status-badge privilege-badge">{tenantDomain.toUpperCase()} WORKSPACE</div>
            </div>
          ) : (
             <div className="logo-icon mx-auto mb-4" style={{width: '48px', height: '48px'}}></div>
          )}
          <h2 className="title-small text-2xl mt-4">
            {tenantDomain ? 'Secure Access' : 'Welcome Back'}
          </h2>
          <p className="text-secondary mt-2">
            {tenantDomain ? `Sign in to access your dashboard` : 'Sign in to manage your workspaces'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
            <ShieldCheck size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="form-layout">
          <div className="form-group">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-secondary" size={18} />
              <input 
                type="email" 
                className="w-full pl-10"
                placeholder="name@company.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary" size={18} />
              <input 
                type="password" 
                className="w-full pl-10"
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-8 py-3 flex-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Secure Sign In'}
          </button>
        </form>

        <p className="text-center text-secondary text-sm mt-8">
          Need help? <a href="#" className="text-accent hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
