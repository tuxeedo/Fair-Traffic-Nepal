import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { analyticsAPI, correctionsAPI } from '../../services/api';
import {
  IconViolation,
  IconWarning,
  IconCreditCard,
  IconAppeal,
  IconReport,
  IconShieldCheck,
  IconAnalytics,
  IconTrendingUp,
} from '../../components/Icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.2)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.2)' } },
  },
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [byType, setByType] = useState([]);
  const [pendingCorrections, setPendingCorrections] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.dashboard(),
      analyticsAPI.dailyViolations({ days: 30 }),
      analyticsAPI.violationsByType(),
      correctionsAPI.allCorrections({ status: 'Pending' }),
    ])
      .then(([s, d, t, c]) => {
        setSummary(s.data);
        setDaily(d.data);
        setByType(t.data);
        setPendingCorrections((c.data.results || c.data || []).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />;

  const dailyChart = {
    labels: daily.map((d) => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Warnings', data: daily.map((d) => d.warnings), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 6 },
      { label: 'Fines', data: daily.map((d) => d.fines), backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6 },
    ],
  };

  const typeChart = {
    labels: byType.map((t) => t.violation_type__name),
    datasets: [
      {
        data: byType.map((t) => t.count),
        backgroundColor: [
          '#6366f1',
          '#06b6d4',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#f97316',
          '#14b8a6',
          '#e11d48',
          '#84cc16',
          '#3b82f6',
          '#d946ef',
          '#a855f7',
        ],
      },
    ],
  };

  const stats = [
    { label: 'TOTAL VIOLATIONS', value: summary?.total_violations || 0, subtext: 'System recorded', icon: IconViolation },
    { label: 'THIS MONTH', value: summary?.violations_this_month || 0, subtext: 'Recent activity', icon: IconTrendingUp },
    { label: 'WARNINGS ISSUED', value: summary?.total_warnings || 0, subtext: 'Non-monetary', icon: IconWarning },
    { label: 'FINES ISSUED', value: summary?.total_fines || 0, subtext: 'Fine tickets', icon: IconViolation },
    { label: 'UNPAID FINES', value: summary?.unpaid_fines || 0, subtext: 'Awaiting payment', icon: IconCreditCard, status: summary?.unpaid_fines > 0 ? 'badge-danger' : 'badge-success' },
    { label: 'TOTAL REVENUE', value: `NPR ${Number(summary?.total_revenue || 0).toLocaleString()}`, subtext: 'Collected fines', icon: IconCreditCard },
    { label: 'PENDING APPEALS', value: summary?.pending_appeals || 0, subtext: 'Requires review', icon: IconAppeal, status: summary?.pending_appeals > 0 ? 'badge-warning' : 'badge-success' },
    { label: 'PENDING REPORTS', value: summary?.pending_reports || 0, subtext: 'Citizen submissions', icon: IconReport, status: summary?.pending_reports > 0 ? 'badge-warning' : 'badge-success' },
    { label: 'PENDING CORRECTIONS', value: pendingCorrections, subtext: 'Profile requests', icon: IconShieldCheck, status: pendingCorrections > 0 ? 'badge-warning' : 'badge-success' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ marginBottom: 8 }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Real-time system statistics and violation analytics</p>
      </div>

      <div className="grid-stats">
        {stats.map((s, i) => {
          const IconComp = s.icon;
          return (
            <div key={i} className="stat-card">
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
                {s.subtext}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24, borderRadius: 14 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAnalytics size={18} color="var(--text-muted)" />
            <span>Daily Violations (Last 30 Days)</span>
          </h3>
          <Bar data={dailyChart} options={chartOpts} />
        </div>

        <div className="glass-card" style={{ padding: 24, borderRadius: 14 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTrendingUp size={18} color="var(--text-muted)" />
            <span>By Violation Type</span>
          </h3>
          <Doughnut
            data={typeChart}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#94a3b8', padding: 10, font: { family: 'Inter', size: 11 } },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
