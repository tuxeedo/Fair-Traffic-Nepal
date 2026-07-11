import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { violationsAPI } from '../../services/api';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ today: 0, warnings: 0, fines: 0 });

  useEffect(() => {
    // Fetch officer's own violations for quick stats (using all violations if admin, or could filter)
    // For now, a simple overview
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Officer Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.first_name} {user?.last_name}</p>
      </div>
      <div className="grid-stats" style={{ marginBottom: 32 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="stat-label">Quick Actions</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="/officer/record-violation" className="btn btn-primary" style={{ justifyContent: 'center' }}>Record Violation</a>
            <a href="/officer/search-driver" className="btn btn-accent" style={{ justifyContent: 'center' }}>Search Driver</a>
            <a href="/officer/search-vehicle" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Search Vehicle</a>
          </div>
        </div>
        <div className="stat-card"><div className="stat-label">Badge Number</div><div className="stat-value" style={{ color: 'var(--color-primary-light)', fontSize: '1.5rem' }}>{user?.officer_profile?.badge_number || 'N/A'}</div></div>
        <div className="stat-card"><div className="stat-label">Station</div><div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{user?.officer_profile?.station || 'N/A'}</div></div>
        <div className="stat-card"><div className="stat-label">Rank</div><div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, textTransform: 'capitalize' }}>{user?.officer_profile?.rank?.replace(/_/g, ' ') || 'N/A'}</div></div>
      </div>
    </div>
  );
}
