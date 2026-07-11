import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { violationsAPI, notificationsAPI } from '../../services/api';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [safetyScore, setSafetyScore] = useState(null);
  const [violations, setViolations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreRes, violRes, notifRes] = await Promise.all([
          violationsAPI.mySafetyScore(),
          violationsAPI.my({ page_size: 5 }),
          notificationsAPI.my({ page_size: 5 }),
        ]);
        setSafetyScore(scoreRes.data);
        setViolations(violRes.data.results || []);
        setNotifications(notifRes.data.results || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const score = safetyScore?.current_score ?? 100;
  const scoreColor = score >= 80 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  const unpaidFines = violations.filter(v => v.action_taken === 'fine' && !v.is_paid);
  const totalFines = unpaidFines.reduce((sum, v) => sum + parseFloat(v.fine_amount), 0);

  if (loading) return <div className="empty-state"><div className="skeleton" style={{ width: 200, height: 24 }} /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.first_name}!</h1>
        <p className="page-subtitle">Your traffic safety overview</p>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 32 }}>
        {/* Safety Score */}
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div className="score-gauge">
            <svg className="score-gauge-circle" width="120" height="120" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="60" fill="none" stroke="var(--border-color)" strokeWidth="8" />
              <circle cx="65" cy="65" r="60" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="score-gauge-value">
              <span className="score-gauge-number" style={{ color: scoreColor, fontSize: '2rem' }}>{score}</span>
              <span className="score-gauge-label">Safety Score</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/citizen/violations')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total Violations</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{violations.length}</div>
        </div>

        <div className="stat-card" onClick={() => navigate('/citizen/violations')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Unpaid Fines</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {unpaidFines.length > 0 ? `NPR ${totalFines.toLocaleString()}` : 'None'}
          </div>
        </div>
      </div>

      {/* Recent violations & notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Violations */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Violations</h3>
          {violations.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.9rem' }}>No violations found. Keep driving safely!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {violations.slice(0, 5).map((v) => (
                <div key={v.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, background: 'rgba(15,23,42,0.5)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.violation_type_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(v.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>
                    {v.action_taken}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Notifications</h3>
          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.9rem' }}>No notifications</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} style={{
                  padding: '10px 12px', borderRadius: 8, background: 'rgba(15,23,42,0.5)',
                  borderLeft: `3px solid ${n.is_read ? 'var(--border-color)' : 'var(--color-primary)'}`,
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {n.message.substring(0, 80)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
