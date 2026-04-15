import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../axios'
import { Users, Building2, Server, Plus, Activity, ExternalLink, LogOut, UserPlus, Trash2, Key } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { TableSkeleton } from '../components/Skeleton'

export default function SuperadminDashboard() {
  const navigate = useNavigate()
  const { tab } = useParams()
  const { addToast } = useToast()
  const activeTab = tab || 'tenants'

  const [tenants, setTenants] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTenant, setNewTenant] = useState({ name: '', domain: '' })
  const [newUser, setNewUser] = useState({ name: '', email: '', tenant_id: '', password: '' })
  
  // Modal States
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch(e) {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    addToast('Logged out successfully', 'info')
    navigate('/login')
  }

  const fetchTenants = async () => {
    try {
      const res = await api.get('/superadmin/tenants')
      setTenants(res.data)
    } finally {
      setLoading(false)
    }
  }
  const fetchUsers = async () => {
    try {
       const res = await api.get('/superadmin/users')
       setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTenants(), fetchUsers()]).then(() => setLoading(false))
  }, [])

  const handleCreateTenant = async (e) => {
    e.preventDefault()
    try {
      await api.post('/superadmin/tenants', newTenant)
      setNewTenant({ name: '', domain: '' })
      setIsTenantModalOpen(false)
      fetchTenants()
      addToast('Tenant created successfully!')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error creating tenant', 'error')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await api.post('/superadmin/users', newUser)
      setNewUser({ name: '', email: '', tenant_id: '', password: '' })
      setIsUserModalOpen(false)
      fetchUsers()
      addToast('User created and assigned to tenant!')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error adding user', 'error')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action is irreversible.')) return
    
    try {
      await api.delete(`/superadmin/users/${id}`)
      fetchUsers()
      addToast('User deleted successfully', 'info')
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting user', 'error')
    }
  }

  return (
    <div className="dashboard-layout">
       {/* Modals */}
       <Modal 
          isOpen={isTenantModalOpen} 
          onClose={() => setIsTenantModalOpen(false)} 
          title="Create New Tenant Workspace"
       >
          <form onSubmit={handleCreateTenant} className="form-layout">
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Otoproject Indonesia" 
                  value={newTenant.name}
                  onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                  required
                />
            </div>
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Path Identifier</label>
                <input 
                  type="text" 
                  placeholder="e.g. otoproject" 
                  value={newTenant.domain}
                  onChange={e => setNewTenant({...newTenant, domain: e.target.value})}
                  required
                />
            </div>
            <button type="submit" className="btn-primary flex-center gap-2 w-full mt-4 py-3">
              <Plus size={18} /> Launch Workspace
            </button>
          </form>
       </Modal>

       <Modal 
          isOpen={isUserModalOpen} 
          onClose={() => setIsUserModalOpen(false)} 
          title="Register New Tenant User"
       >
          <form onSubmit={handleAddUser} className="form-layout">
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required
                />
            </div>
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                />
            </div>
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Security Password</label>
                <div className="relative">
                   <Key size={16} className="absolute left-3 top-4 text-secondary" />
                   <input 
                    type="password" 
                    placeholder="Min 6 characters (empty for password123)" 
                    className="pl-10"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
            </div>
            <div className="form-group">
                <label className="text-xs uppercase font-bold text-secondary mb-2 block">Target Destination</label>
                <select 
                  value={newUser.tenant_id}
                  onChange={e => setNewUser({...newUser, tenant_id: e.target.value})}
                  required
                  className="w-full bg-black/20 border border-white/10 p-3 rounded-lg text-white"
                >
                  <option value="" disabled>Select Tenant Access</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#16171d]">{t.name} ({t.domain})</option>
                  ))}
                </select>
            </div>
            <button type="submit" className="btn-primary flex-center gap-2 w-full mt-4 py-3">
              <UserPlus size={18} /> Assign User
            </button>
          </form>
       </Modal>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Server size={28} className="text-accent" />
          <h2 className="title-small">Superadmin</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'tenants' ? 'active' : ''}`}
            onClick={() => navigate('/superadmin/tenants')}
          >
            <Building2 size={20} /> Tenants
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => navigate('/superadmin/users')}
          >
            <Users size={20} /> Users Global
          </button>
        </nav>

        <div className="mt-auto pt-8">
           <button onClick={handleLogout} className="nav-item text-red-400 hover:text-red-500 hover:bg-red-500/10">
              <LogOut size={20} /> Secure Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>{activeTab === 'tenants' ? 'Tenant Management' : 'Global Users'}</h1>
          <div className="status-indicator online">
            <span className="dot"></span> System Operational
          </div>
        </header>

        {activeTab === 'tenants' && (
          <div className="content-grid full-width">
            <div className="glass-card full-width">
              <div className="dashboard-header border-none mb-4 p-0">
                 <h3>Active Tenants</h3>
                 <button onClick={() => setIsTenantModalOpen(true)} className="btn-primary flex-center gap-2">
                    <Plus size={18} /> New Workspace
                 </button>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <TableSkeleton cols={5} rows={6} />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Company Name</th>
                        <th>Domain Identifier</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map(t => (
                        <tr key={t.id}>
                          <td>#{t.id}</td>
                          <td className="font-bold">{t.name}</td>
                          <td className="text-secondary">{t.domain}</td>
                          <td>
                            <span className={`status-badge ${t.is_active ? 'active' : 'inactive'}`}>
                              {t.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <Link to={`/${t.domain}`} className="text-accent flex-center gap-1 text-sm font-semibold hover:underline">
                              Open <ExternalLink size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {tenants.length === 0 && <tr><td colSpan="5" className="text-center text-secondary py-4">No tenants found.</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="content-grid full-width">
            <div className="glass-card span-2">
              <div className="dashboard-header border-none mb-4 p-0">
                <h3>Registered Core Users</h3>
                <button onClick={() => setIsUserModalOpen(true)} className="btn-primary flex-center gap-2">
                    <UserPlus size={18} /> Add Tenant User
                </button>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <TableSkeleton cols={5} rows={6} />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Admin?</th>
                        <th>Linked Tenants</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td className="font-bold">{u.name}</td>
                          <td className="text-secondary">{u.email}</td>
                          <td>
                            {u.is_superadmin ? <span className="status-badge active">Global</span> : <span className="text-secondary">-</span>}
                          </td>
                          <td>
                            <div className="flex-center gap-1 flex-wrap">
                              {u.tenants?.map(t => (
                                <span key={t.id} className="status-badge privilege-badge text-xs" style={{fontSize: '10px'}}>
                                  {t.domain}
                                </span>
                              ))}
                              {(!u.tenants || u.tenants.length === 0) && <span className="text-secondary">-</span>}
                            </div>
                          </td>
                          <td>
                             <button 
                               onClick={() => handleDeleteUser(u.id)}
                               className="p-2 hover:bg-red-500/10 text-red-400 hover:text-red-500 rounded-lg transition-colors"
                               title="Delete User"
                             >
                               <Trash2 size={18} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
