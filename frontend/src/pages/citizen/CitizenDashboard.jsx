import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { violationsAPI, notificationsAPI, vehiclesAPI } from '../../services/api';
import { getNotificationDestination } from '../../utils/notificationUtils';
import {
  IconCar,
  IconViolation,
  IconCreditCard,
  IconAppeal,
  IconReport,
  IconMap,
  IconTrafficLight,
  IconService,
  IconShieldCheck,
  IconWarning,
  IconBell,
  IconArrowRight,
  IconSparkles,
} from '../../components/Icons';

export default function CitizenDashboard() {
  const { user, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [safetyScore, setSafetyScore] = useState(null);
  const [violations, setViolations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoreRes, violRes, notifRes, vehRes] = await Promise.all([
          violationsAPI.mySafetyScore(),
          violationsAPI.my({ page_size: 5 }),
          notificationsAPI.my({ page_size: 5 }),
          vehiclesAPI.myVehicles(),
        ]);
        setSafetyScore(scoreRes.data);
        setViolations(violRes.data.results || []);
        setNotifications(notifRes.data.results || []);
        setVehicles(vehRes.data || []);
      } catch {
        /* ignore */
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const score = safetyScore?.current_score ?? 100;

  // Dynamic Driving Rank Badge
  const getRankBadge = (val) => {
    if (val >= 90) return { title: 'Gold Star Driver', class: 'rank-gold', icon: IconSparkles };
    if (val >= 75) return { title: 'Safe Driver', class: 'rank-silver', icon: IconShieldCheck };
    return { title: 'Caution Required', class: 'rank-caution', icon: IconWarning };
  };

  const rank = getRankBadge(score);
  const RankIcon = rank.icon;

  const unpaidFines = violations.filter((v) => v.action_taken === 'fine' && !v.is_paid);
  const totalFinesSum = unpaidFines.reduce((sum, v) => sum + parseFloat(v.fine_amount || 0), 0);

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <div className="skeleton" style={{ width: 220, height: 28, margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '100%', height: 160 }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Hero Welcome Banner (Clean borderless card with Modern Indigo CTA button) */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          borderRadius: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Jay Nepal, {user?.first_name || user?.username}!
            </h1>
            <span className={`rank-badge ${rank.class}`}>
              <RankIcon size={13} />
              <span>{rank.title}</span>
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Here is your live Nepal FairTraffic safety overview and driving standing.
          </p>
        </div>

        <button
          className="btn"
          onClick={() => navigate('/citizen/map')}
          style={{
            background: '#4F46E5',
            color: '#ffffff',
            borderRadius: 12,
            padding: '10px 20px',
            fontWeight: 600,
            border: 'none',
          }}
        >
          <IconMap size={18} />
          <span>Open Live Traffic Map</span>
        </button>
      </div>

      {/* Identity Verification Prompt Banner */}
      {!isProfileComplete && (
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            borderLeft: '4px solid var(--color-warning)',
            background: 'rgba(245, 158, 11, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            borderRadius: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconWarning size={20} color="var(--color-warning)" />
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Account Verification Pending
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Please complete your Phone, Citizenship No., License No., and Address profile.
              </p>
            </div>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/citizen/dashboard')} style={{ borderRadius: 8 }}>
            Complete Verification
          </button>
        </div>
      )}

      {/* 2, 3, 4. Minimal Modern Metric Cards Grid (Standardized Icon Styling & Big Consistent Stats) */}
      <div className="grid-stats">
        {/* Safety Score Card */}
        <div className="stat-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">SAFETY SCORE</span>
              <IconShieldCheck size={20} color="var(--text-muted)" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="stat-value">{score}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
              <span className={`badge ${score >= 80 ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>
                {score >= 80 ? 'Optimal' : 'Caution'}
              </span>
            </div>
          </div>
          <Link
            to="/citizen/safety-score"
            style={{
              marginTop: 16,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Score Breakdown</span>
            <IconArrowRight size={14} />
          </Link>
        </div>

        {/* Registered Vehicles Card */}
        <div className="stat-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">REGISTERED VEHICLES</span>
              <IconCar size={20} color="var(--text-muted)" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="stat-value">{vehicles.length || 0}</span>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                Active
              </span>
            </div>
          </div>
          <Link
            to="/citizen/vehicles"
            style={{
              marginTop: 16,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Manage Vehicles</span>
            <IconArrowRight size={14} />
          </Link>
        </div>

        {/* Total Violations Card */}
        <div className="stat-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">TOTAL VIOLATIONS</span>
              <IconViolation size={20} color="var(--text-muted)" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="stat-value">{violations.length || 0}</span>
            </div>
          </div>
          <Link
            to="/citizen/violations"
            style={{
              marginTop: 16,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>View Violations</span>
            <IconArrowRight size={14} />
          </Link>
        </div>

        {/* Unpaid Fines Card */}
        <div className="stat-card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-label">UNPAID FINES</span>
              <IconCreditCard size={20} color="var(--text-muted)" />
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="stat-value">NPR {totalFinesSum.toLocaleString()}</span>
              <span
                className={`badge ${unpaidFines.length > 0 ? 'badge-danger' : 'badge-success'}`}
                style={{ marginLeft: 'auto' }}
              >
                {unpaidFines.length > 0 ? `${unpaidFines.length} Pending` : 'Paid'}
              </span>
            </div>
          </div>
          <Link
            to="/citizen/violations"
            style={{
              marginTop: 16,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: unpaidFines.length > 0 ? 'var(--color-danger)' : 'var(--color-primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{unpaidFines.length > 0 ? 'Pay Pending Fine(s)' : 'Payment History'}</span>
            <IconArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          <Link to="/citizen/violations" className="quick-action-card">
            <IconCreditCard size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pay Fines</span>
          </Link>

          <Link to="/citizen/vehicles" className="quick-action-card">
            <IconCar size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>My Vehicles</span>
          </Link>

          <Link to="/citizen/appeals" className="quick-action-card">
            <IconAppeal size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>File Appeal</span>
          </Link>

          <Link to="/citizen/reports" className="quick-action-card">
            <IconReport size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Report Hazard</span>
          </Link>

          <Link to="/citizen/map" className="quick-action-card">
            <IconMap size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Traffic Map</span>
          </Link>

          <Link to="/citizen/traffic-signs" className="quick-action-card">
            <IconTrafficLight size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Traffic Signs</span>
          </Link>

          <Link to="/citizen/community-service" className="quick-action-card">
            <IconService size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Community Service</span>
          </Link>
        </div>
      </div>

      {/* Activity Feed Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Violations */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconViolation size={18} color="var(--text-muted)" />
              <span>Recent Violations</span>
            </h3>
            <Link to="/citizen/violations" style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
              View All
            </Link>
          </div>

          {violations.length === 0 ? (
            <div
              className="empty-state"
              style={{
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconShieldCheck size={36} color="var(--color-success)" />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                No recent violations recorded. Safe driving!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {violations.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {v.violation_type_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(v.created_at).toLocaleDateString()} {v.location_name ? `• ${v.location_name}` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>
                      {v.action_taken}
                    </span>
                    {v.action_taken === 'fine' && !v.is_paid && (
                      <button
                        className="btn btn-success btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => navigate(`/citizen/pay/${v.id}`)}
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', borderRadius: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBell size={18} color="var(--text-muted)" />
              <span>Recent Notifications</span>
            </h3>
            <Link to="/citizen/notifications" style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
              View All
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div
              className="empty-state"
              style={{
                padding: 24,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBell size={36} color="var(--text-muted)" />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                You are all caught up! No new notifications.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${n.is_read ? 'var(--border-strong)' : 'var(--color-primary)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={async () => {
                    if (!n.is_read) {
                      try {
                        await notificationsAPI.markRead(n.id);
                      } catch {}
                    }
                    navigate(getNotificationDestination(n, 'citizen'));
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{n.title}</span>
                    <IconArrowRight size={14} color="var(--color-primary-light)" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {n.message.substring(0, 85)}
                    {n.message.length > 85 ? '...' : ''}
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
