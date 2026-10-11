import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
const palette = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#c084fc', '#2dd4bf', '#fb923c', '#a3e635', '#f472b6', '#60a5fa', '#e879f9'];

export default function AdminViolationCharts({ daily, byType }) {
  const [stacked, setStacked] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme'));
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(document.documentElement.getAttribute('data-theme')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  const textColor = theme === 'light' ? '#475569' : '#b5c1d2';
  const gridColor = theme === 'light' ? '#e7edf5' : '#2b394b';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const warnings = daily.reduce((sum, d) => sum + Number(d.warnings || 0), 0);
  const fines = daily.reduce((sum, d) => sum + Number(d.fines || 0), 0);
  const typeTotal = byType.reduce((sum, t) => sum + Number(t.count || 0), 0);
  const sortedTypes = [...byType].sort((a, b) => b.count - a.count);
  const chartData = {
    labels: daily.map(d => new Date(`${d.date}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Warnings', data: daily.map(d => Number(d.warnings || 0)), backgroundColor: '#fbbf24', borderRadius: 5, maxBarThickness: 24 },
      { label: 'Fines', data: daily.map(d => Number(d.fines || 0)), backgroundColor: '#818cf8', borderRadius: 5, maxBarThickness: 24 },
    ],
  };
  const options = {
    responsive: true, maintainAspectRatio: false, animation: reducedMotion ? false : { duration: 300 },
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#101d36', titleColor: '#fff', bodyColor: '#dbe4ff', padding: 12, cornerRadius: 10, displayColors: true } },
    scales: {
      x: { stacked, border: { display: false }, grid: { display: false }, ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 7, font: { size: 11 } } },
      y: { stacked, beginAtZero: true, border: { display: false }, grid: { color: gridColor }, ticks: { color: textColor, precision: 0, maxTicksLimit: 6, font: { size: 11 } } },
    },
  };
  return (
    <div className="admin-charts-grid">
      <section className="glass-card analytics-panel" aria-labelledby="daily-chart-title">
        <div className="analytics-panel-header"><div><span className="section-eyebrow">Enforcement activity</span><h2 id="daily-chart-title">Daily violations</h2><p>Last 30 days · Warnings and fines</p></div><div className="chart-view-switch" role="group" aria-label="Bar chart display"><button aria-pressed={!stacked} onClick={() => setStacked(false)}>Grouped</button><button aria-pressed={stacked} onClick={() => setStacked(true)}>Stacked</button></div></div>
        <div className="chart-summary"><div><i style={{ background: '#fbbf24' }} /><span>Warnings</span><strong>{warnings.toLocaleString()}</strong></div><div><i style={{ background: '#818cf8' }} /><span>Fines</span><strong>{fines.toLocaleString()}</strong></div><span className="chart-total">{(warnings + fines).toLocaleString()} combined</span></div>
        {warnings + fines > 0 ? <>
          <div className="bar-chart-frame"><Bar data={chartData} options={options} role="img" aria-label={`Daily violations in the last 30 days: ${warnings} warnings and ${fines} fines. Detailed values follow.`} /></div>
          <details className="chart-data-details"><summary>View daily counts</summary><ul>{daily.map(d => <li key={d.date}><span>{d.date}</span><span>{d.warnings || 0} warnings · {d.fines || 0} fines</span></li>)}</ul></details>
        </> : <div className="chart-empty"><span aria-hidden="true">▥</span><h3>No warnings or fines recorded</h3><p>Daily activity will appear here when records are available.</p></div>}
      </section>
      <section className="glass-card analytics-panel" aria-labelledby="type-chart-title">
        <div className="analytics-panel-header"><div><span className="section-eyebrow">Violation breakdown</span><h2 id="type-chart-title">By violation type</h2><p>All recorded violations · Share of total</p></div></div>
        {typeTotal > 0 ? <>
          <div className="doughnut-chart-frame"><Doughnut data={{ labels: sortedTypes.map(t => t.violation_type__name || 'Unspecified'), datasets: [{ data: sortedTypes.map(t => Number(t.count)), backgroundColor: sortedTypes.map((_, i) => palette[i % palette.length]), borderWidth: 0, spacing: 3, hoverOffset: 5 }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: '76%', animation: reducedMotion ? false : { duration: 300 }, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#101d36', padding: 12, cornerRadius: 10, callbacks: { label: context => ` ${context.parsed.toLocaleString()} violations (${(context.parsed / typeTotal * 100).toFixed(1)}%)` } } } }} role="img" aria-label={`Breakdown of ${typeTotal} violations by type. Counts and percentages listed below.`} /><div className="doughnut-center" aria-hidden="true"><strong>{typeTotal.toLocaleString()}</strong><span>total violations</span></div></div>
          <ul className="type-chart-legend">{sortedTypes.map((t, i) => <li key={t.violation_type__name || i}><i style={{ background: palette[i % palette.length] }} /><span>{t.violation_type__name || 'Unspecified'}</span><strong>{Number(t.count).toLocaleString()}</strong><small>{(Number(t.count) / typeTotal * 100).toFixed(1)}%</small></li>)}</ul>
        </> : <div className="chart-empty"><span aria-hidden="true">◯</span><h3>No violation types yet</h3><p>The breakdown will appear once violations are recorded.</p></div>}
      </section>
    </div>
  );
}
