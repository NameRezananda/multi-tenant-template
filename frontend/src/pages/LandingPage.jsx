import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../axios'

export default function LandingPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Attempt to fetch from backend
    api.get('/products')
      .then(res => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
         setError(err.response?.data?.message || err.message)
         setLoading(false)
      })
  }, [])

  return (
    <div className="app-container">
      <div className="background-gradient"></div>
      
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <h1>Autohub <span className="text-gradient">V3</span></h1>
        </div>
        <nav>
          <Link to="/superadmin" className="nav-link">Superadmin</Link>
          <Link to="/default-tenant" className="nav-link">Tenant Dashboard</Link>
          <Link to="/" className="nav-link">Services</Link>
          <button className="btn-primary">Get Started</button>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="badge">Multi-Tenant Platform</div>
          <h2 className="title">Next-Generation Auto Management</h2>
          <p className="subtitle">
            Experience the unprecedented speed and isolation of our modern, single-database multi-tenant architecture designed exclusively for scale.
          </p>
        </section>

        <section className="data-section">
          <div className="glass-panel">
            <div className="panel-header">
              <h3>Database Connection Status</h3>
              <div className={`status-indicator ${loading ? 'loading' : error ? 'offline' : 'online'}`}>
                <span className="dot"></span>
                {loading ? 'Connecting...' : error ? 'Disconnected' : 'Connected'}
              </div>
            </div>

            <div className="panel-content">
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Establishing secure connection to database...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h4>Connection Failed</h4>
                  <p className="error-message">{error}</p>
                  <p className="error-hint">Make sure your Laravel backend is running on port 8000.</p>
                  <button className="btn-secondary" onClick={() => window.location.reload()}>Try Again</button>
                </div>
              )}

              {data && (
                <div className="success-state">
                  <div className="data-grid">
                    <div className="data-card">
                      <div className="card-label">System State</div>
                      <div className="card-value success">Operational</div>
                    </div>
                    <div className="data-card">
                      <div className="card-label">Total Products Indexed</div>
                      <div className="card-value">{Array.isArray(data) ? data.length : 0}</div>
                    </div>
                  </div>
                  
                  <div className="raw-response">
                    <div className="raw-header">Raw Response (/api/products)</div>
                    <pre><code>{JSON.stringify(data, null, 2)}</code></pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
