import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminViolationCharts from '../../components/AdminViolationCharts';
import { analyticsAPI, correctionsAPI } from '../../services/api';
import DashboardArtwork from '../../components/DashboardArtwork';
import {
  IconViolation,
  IconWarning,
  IconCreditCard,
  IconAppeal,
  IconReport,
  IconShieldCheck,
  IconTrendingUp,
} from '../../components/Icons';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [byType, setByType] = useState([]);
  const [pendingCorrections, setPendingCorrections] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      analyticsAPI.dashboard(),
      analyticsAPI.dailyViolations({ days: 30 }),
      analyticsAPI.violationsByType(),
      correctionsAPI.allCorrections({ status: 'Pending' }),
    ])
      .then(([s, d, t, c]) => {
        if (!active) return;
        setSummary(s.data);
        setDaily(d.data);
        setByType(t.data);
        setPendingCorrections(c.data.count ?? (c.data.results || c.data || []).length);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />;
  if (error) return <div className="empty-state" role="alert"><h2>Dashboard data unavailable</h2><p className="page-subtitle">Please try again to load the charts and statistics.</p><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>;

  const stats = [
    { label: 'TOTAL VIOLATIONS', to: '/admin/violations?view=active', value: summary?.total_violations || 0, subtext: 'System recorded', icon: IconViolation },
    { label: 'LAST 30 DAYS', to: '/admin/violations?view=recent', value: summary?.violations_this_month || 0, subtext: 'Recent activity', icon: IconTrendingUp },
    { label: 'WARNINGS ISSUED', to: '/admin/violations?view=warnings', value: summary?.total_warnings || 0, subtext: 'Non-monetary', icon: IconWarning },
    { label: 'FINES ISSUED', to: '/admin/violations?view=fines', value: summary?.total_fines || 0, subtext: 'Fine tickets', icon: IconViolation },
    { label: 'UNPAID FINES', to: '/admin/violations?view=unpaid', value: summary?.unpaid_fines || 0, subtext: 'Awaiting payment', icon: IconCreditCard, status: summary?.unpaid_fines > 0 ? 'badge-danger' : 'badge-success' },
    { label: 'TOTAL REVENUE', to: '/admin/violations?view=paid', value: `NPR ${Number(summary?.total_revenue || 0).toLocaleString()}`, subtext: 'Collected fines', icon: IconCreditCard },
    { label: 'PENDING APPEALS', to: '/admin/appeals?status=pending', value: summary?.pending_appeals || 0, subtext: 'Requires review', icon: IconAppeal, status: summary?.pending_appeals > 0 ? 'badge-warning' : 'badge-success' },
    { label: 'PENDING REPORTS', to: '/admin/reports?status=pending', value: summary?.pending_reports || 0, subtext: 'Citizen submissions', icon: IconReport, status: summary?.pending_reports > 0 ? 'badge-warning' : 'badge-success' },
    { label: 'PENDING CORRECTIONS', to: '/admin/corrections?status=Pending', value: pendingCorrections, subtext: 'Profile requests', icon: IconShieldCheck, status: pendingCorrections > 0 ? 'badge-warning' : 'badge-success' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header dashboard-welcome" style={{ marginBottom: 8 }}>
        <DashboardArtwork />
        <span className="welcome-eyebrow">Traffic operations overview</span>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Review pending work and monitor traffic enforcement across the system.</p>
      </div>

      <div className="grid-stats">
        {stats.map((s, i) => {
          const IconComp = s.icon;
          return (
            <Link key={i} to={s.to} className="stat-card dashboard-stat-link" aria-label={`View ${s.label.toLowerCase()}`}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="stat-label">{s.label}</span>
                  <IconComp size={18} color="var(--text-muted)" />
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="stat-value">{s.value}</span>
                  {s.status && (
                    <span className={`badge ${s.status}`} style={{ marginLeft: 'auto' }}>
                      {s.status.includes('danger') ? 'Action Needed' : s.status.includes('warning') ? 'Pending' : 'Normal'}
                    </span>
                  )}
                </div>
              </div>
              <div className="stat-subtext" style={{ marginTop: 8 }}>
                {s.subtext} · View list
              </div>
            </Link>
          );
        })}
      </div>

      <AdminViolationCharts daily={daily} byType={byType} />
    </div>
  );
}
