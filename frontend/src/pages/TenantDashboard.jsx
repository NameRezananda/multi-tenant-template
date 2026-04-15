import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../axios'
import { Users, UserPlus, ShieldAlert, LayoutDashboard, LogOut } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { TableSkeleton } from '../components/Skeleton'

export default function TenantDashboard() {
  const navigate = useNavigate()
  const { tenantDomain } = useParams()
  const { addToast } = useToast()
  const [tenantUsers, setTenantUsers] = useState([])
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  
  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch(e) {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    addToast('Logged out successfully', 'info')
    navigate('/login')
  }

  const currentTenantInfo = tenantDomain || 'default-tenant'

  const fetchTenantUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/tenant/users')
      setTenantUsers(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenantUsers()
  }, [tenantDomain])

  const handleInvite = async (e) => {
    e.preventDefault()
    try {
      await api.post('/tenant/users', newUser)
      setNewUser({ name: '', email: '' })
      setIsInviteModalOpen(false)
      fetchTenantUsers()
      addToast('Team member invited successfully!')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error inviting user', 'error')
    }
  }

  if (error) {
    return (
      <div className="dashboard-layout error-mode flex-center">
        <div className="glass-card text-center max-w-md">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h3>Tenant Mismatch Error</h3>
          <p className="text-secondary mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout tenant-theme">
      {/* Modals */}
      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Invite New Team Member"
      >
        <form onSubmit={handleInvite} className="form-layout">
          <div className="form-group">
            <label className="text-xs uppercase font-bold text-secondary mb-2 block">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Jane Smith" 
              value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="text-xs uppercase font-bold text-secondary mb-2 block">Email Address</label>
            <input 
              type="email" 
              placeholder="jane@company.com" 
              value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary flex-center gap-2 w-full mt-4 py-3">
            <UserPlus size={18} /> Send Invitation
          </button>
        </form>
      </Modal>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <LayoutDashboard size={28} className="text-tenant" />
          <h2 className="title-small tracking-tight">Workspace</h2>
        </div>
        <div className="tenant-badge mt-2">{currentTenantInfo}</div>
        
        <nav className="sidebar-nav mt-8">
           <button className="nav-item active"><Users size={20} /> Team Members</button>
        </nav>

        <div className="mt-auto pt-8">
           <button onClick={handleLogout} className="nav-item text-red-400 hover:text-red-500 hover:bg-red-500/10">
              <LogOut size={20} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>{currentTenantInfo.toUpperCase()} Dashboard</h1>
          <div className="status-indicator online">
             Data Sequestered
          </div>
        </header>

        <div className="content-grid mt-6 full-width">
          <div className="glass-card span-2">
            <div className="dashboard-header border-none mb-4 p-0">
               <h3>Directory</h3>
               <button onClick={() => setIsInviteModalOpen(true)} className="btn-primary flex-center gap-2">
                  <UserPlus size={18} /> Invite Member
               </button>
            </div>
            <div className="table-responsive">
              {loading ? (
                 <TableSkeleton rows={6} cols={4} />
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Workspace Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantUsers.map(u => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td className="font-bold">{u.name}</td>
                        <td className="text-secondary">{u.email}</td>
                        <td>
                          <span className="status-badge privilege-badge">
                            {u.pivot?.role || 'Staff'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tenantUsers.length === 0 && <tr><td colSpan="4" className="text-center text-secondary py-4">No team members yet.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
