import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { analyticsAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);
const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } } } };

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [byType, setByType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.dailyViolations({ days: 30 }), analyticsAPI.violationsByType()])
      .then(([s, d, t]) => { setSummary(s.data); setDaily(d.data); setByType(t.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const dailyChart = {
    labels: daily.map(d => new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Warnings', data: daily.map(d => d.warnings), backgroundColor: 'rgba(245,158,11,0.6)', borderRadius: 4 },
      { label: 'Fines', data: daily.map(d => d.fines), backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 4 },
    ],
  };

  const typeChart = {
    labels: byType.map(t => t.violation_type__name),
    datasets: [{ data: byType.map(t => t.count), backgroundColor: ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#14b8a6','#e11d48','#84cc16','#3b82f6','#d946ef','#a855f7'] }],
  };

  const stats = [
    { label: 'Total Violations', value: summary?.total_violations, color: 'var(--color-primary-light)' },
    { label: 'This Month', value: summary?.violations_this_month, color: 'var(--color-accent)' },
    { label: 'Warnings', value: summary?.total_warnings, color: 'var(--color-warning)' },
    { label: 'Fines', value: summary?.total_fines, color: 'var(--color-danger)' },
    { label: 'Unpaid Fines', value: summary?.unpaid_fines, color: 'var(--color-danger-light)' },
    { label: 'Revenue', value: `NPR ${Number(summary?.total_revenue || 0).toLocaleString()}`, color: 'var(--color-success)' },
    { label: 'Pending Appeals', value: summary?.pending_appeals, color: 'var(--color-primary)' },
    { label: 'Pending Reports', value: summary?.pending_reports, color: 'var(--color-accent)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">System overview and analytics</p></div>

      <div className="grid-stats" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Daily Violations (Last 30 Days)</h3>
          <Bar data={dailyChart} options={chartOpts} />
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>By Violation Type</h3>
          <Doughnut data={typeChart} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 8, font: { size: 10 } } } } }} />
        </div>
      </div>
    </div>
  );
}
