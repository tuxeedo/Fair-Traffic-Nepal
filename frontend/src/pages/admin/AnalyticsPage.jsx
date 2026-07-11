import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { analyticsAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [appealStats, setAppealStats] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.monthlyViolations(), analyticsAPI.topOffenders(), analyticsAPI.appealStats(), analyticsAPI.reportStats()])
      .then(([m, o, a, r]) => { setMonthly(m.data); setOffenders(o.data); setAppealStats(a.data); setReportStats(r.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const chartOpts = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } }, y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(51,65,85,0.3)' } } } };

  const monthlyChart = {
    labels: monthly.map(m => new Date(m.month).toLocaleDateString('en', { month: 'short', year: '2-digit' })),
    datasets: [
      { label: 'Total', data: monthly.map(m => m.total), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
      { label: 'Warnings', data: monthly.map(m => m.warnings), borderColor: '#f59e0b', backgroundColor: 'transparent', tension: 0.4 },
      { label: 'Fines', data: monthly.map(m => m.fines), borderColor: '#ef4444', backgroundColor: 'transparent', tension: 0.4 },
    ],
  };

  const appealChart = appealStats ? {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [{ data: [appealStats.accepted, appealStats.rejected, appealStats.pending], backgroundColor: ['#10b981', '#ef4444', '#6366f1'] }],
  } : null;

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Analytics</h1><p className="page-subtitle">Detailed system analytics</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Monthly Trend</h3>
          <Line data={monthlyChart} options={chartOpts} />
        </div>
        {appealChart && (
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Appeals ({appealStats.acceptance_rate}% accepted)</h3>
            <Doughnut data={appealChart} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Top Repeat Offenders</h3>
          {offenders.length === 0 ? <div className="empty-state" style={{ padding: 20 }}>No data</div> : (
            <table className="data-table">
              <thead><tr><th>Driver</th><th>License</th><th>Violations</th><th>Total Fines</th></tr></thead>
              <tbody>{offenders.map((o, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{o.driver__first_name} {o.driver__last_name}</td>
                  <td>{o.driver__license_number || '-'}</td>
                  <td><span className="badge badge-warning">{o.violation_count}</span></td>
                  <td>NPR {o.total_fines || 0}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Community Reports</h3>
          {reportStats ? (
            <div>
              <div className="grid-stats" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 16 }}>
                <div className="stat-card" style={{ padding: 12 }}><div className="stat-label" style={{ fontSize: '0.7rem' }}>Total</div><div className="stat-value" style={{ fontSize: '1.5rem' }}>{reportStats.total}</div></div>
                <div className="stat-card" style={{ padding: 12 }}><div className="stat-label" style={{ fontSize: '0.7rem' }}>Approved</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>{reportStats.approved}</div></div>
                <div className="stat-card" style={{ padding: 12 }}><div className="stat-label" style={{ fontSize: '0.7rem' }}>Pending</div><div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--color-warning)' }}>{reportStats.pending}</div></div>
              </div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>By Type:</h4>
              {reportStats.by_type.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  <span>{t.report_type.replace(/_/g,' ')}</span><span className="badge badge-info">{t.count}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state" style={{ padding: 20 }}>No data</div>}
        </div>
      </div>
    </div>
  );
}
