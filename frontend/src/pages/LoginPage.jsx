import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      showToast('Login successful!');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: 20,
    }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: 'white',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            FT
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>FairTraffic</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Smart Traffic Violation Management
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="glass-card" style={{ padding: 16, marginTop: 16 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8 }}>
            Demo Credentials
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
            {[
              { label: 'Admin', user: 'admin', pass: 'admin123' },
              { label: 'Officer', user: 'officer1', pass: 'officer123' },
              { label: 'Citizen', user: 'citizen1', pass: 'citizen123' },
            ].map((cred) => (
              <button
                key={cred.user}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.7rem', display: 'block', textAlign: 'center', padding: '8px 4px' }}
                onClick={() => { setUsername(cred.user); setPassword(cred.pass); }}
              >
                {cred.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
