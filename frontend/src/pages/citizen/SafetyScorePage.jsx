import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { violationsAPI } from '../../services/api';
import { IconShieldCheck, IconArrowRight, IconTrendingUp } from '../../components/Icons';

export default function SafetyScorePage() {
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    Promise.all([violationsAPI.mySafetyScore(), violationsAPI.mySafetyHistory()])
      .then(([s, h]) => { if (active) { setScore(s.data); setHistory(h.data.results || (Array.isArray(h.data) ? h.data : [])); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  if (loading) return <div className="skeleton" role="status" aria-label="Loading safety score" style={{ height: 360 }} />;
  if (error || score?.current_score == null) return <div className="empty-state" role="alert"><h2>Safety score unavailable</h2><p className="page-subtitle">We couldn’t load your driving record. Please try again.</p><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>;
  const current = Number(score.current_score);
  const standing = current >= 80 ? 'Safe driving' : current >= 50 ? 'Room to improve' : 'Needs attention';
  const tone = current >= 80 ? 'success' : current >= 50 ? 'warning' : 'danger';
  const circumference = 2 * Math.PI * 76;
  const recent = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const trend = recent.slice(0, 12).reverse();
  const points = trend.map((item, index) => `${trend.length === 1 ? 150 : 12 + index * 276 / (trend.length - 1)},${100 - Math.max(0, Math.min(100, Number(item.new_score))) * .8}`);
  return (
    <div className="safety-page animate-fade-in">
      <div className="page-header"><span className="section-eyebrow">Your driving record</span><h1 className="page-title">Driver Safety Score</h1><p className="page-subtitle">See where you stand and how your driving record changes over time.</p></div>
      <div className="safety-overview">
        <section className={`safety-score-card score-tone-${tone}`} aria-labelledby="current-score-title">
          <div className="panel-heading"><IconShieldCheck size={22} /><h2 id="current-score-title">Your current score</h2></div>
          <div className="safety-ring" role="img" aria-label={`Safety score ${current} out of 100. ${standing}.`}>
            <svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="76" fill="none" stroke="var(--bg-surface-raised)" strokeWidth="12" /><circle cx="90" cy="90" r="76" fill="none" stroke="var(--score-color)" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.max(0, Math.min(100, current)) / 100)} transform="rotate(-90 90 90)" /></svg>
            <div><strong>{current}</strong><span>OUT OF 100</span></div>
          </div>
          <span className={`badge badge-${tone}`}>{standing}</span>
          <p>{current >= 80 ? 'Keep building good habits. Every safe journey counts.' : 'Follow traffic rules and avoid further violations to protect your score.'}</p>
          <div className="score-update">Last updated {score.last_updated ? new Date(score.last_updated).toLocaleDateString() : 'date unavailable'}</div>
          <Link className="score-record-link" to="/citizen/violations">Review your violations <IconArrowRight size={16} /></Link>
        </section>
        <div className="safety-detail-stack">
          <section className="glass-card score-trend-panel">
            <div className="panel-heading"><IconTrendingUp size={20} /><h2>Recent score movement</h2><span className="panel-caption">Last {trend.length} recorded changes</span></div>
            {trend.length > 0 ? <>
              <svg className="score-trend" viewBox="0 0 300 115" role="img" aria-label={`Recent recorded scores: ${trend.map(item => item.new_score).join(', ')}`}>
                {[20, 60, 100].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="var(--border-subtle)" strokeDasharray="3 5" />)}
                {trend.length > 1 && <polyline points={points.join(' ')} fill="none" stroke="var(--color-primary-light)" strokeWidth="3" strokeLinejoin="round" />}
                {points.map((point, index) => { const [cx, cy] = point.split(','); return <circle key={index} cx={cx} cy={cy} r="4" fill="var(--color-primary-light)" stroke="var(--bg-surface)" strokeWidth="2" />; })}
              </svg>
              <div className="trend-date-range"><span>{new Date(trend[0].created_at).toLocaleDateString()}</span><span>{new Date(trend[trend.length - 1].created_at).toLocaleDateString()}</span></div>
            </> : <div className="score-no-history"><IconShieldCheck size={30} /><p>No score changes recorded yet.</p></div>}
          </section>
          <section className="glass-card score-guide"><span className="section-eyebrow">Understanding your score</span><h2>Small habits. Safer roads.</h2>
            <div className="score-bands"><div><i className="band-dot band-safe" /><strong>80–100</strong><span>Safe driving</span></div><div><i className="band-dot band-fair" /><strong>50–79</strong><span>Room to improve</span></div><div><i className="band-dot band-risk" /><strong>0–49</strong><span>Needs attention</span></div></div>
            <p>Violations can reduce your score; eligible good behavior can restore points. Your history below shows the actual changes applied to your record.</p>
          </section>
        </div>
      </div>
      <section className="glass-card score-history-panel">
        <div className="panel-heading"><h2>Score activity</h2><span className="panel-caption">{history.length} loaded {history.length === 1 ? 'record' : 'records'}</span></div>
        {recent.length === 0 ? <div className="empty-state"><IconShieldCheck size={32} /><p className="empty-state-text">Your score history will appear here after a change.</p></div> : <ol className="score-timeline">
          {recent.map(item => <li key={item.id}><span className={`score-change-icon ${item.score_change > 0 ? 'change-positive' : item.score_change < 0 ? 'change-negative' : 'change-neutral'}`} aria-hidden="true">{item.score_change > 0 ? '↗' : item.score_change < 0 ? '↘' : '–'}</span><div className="score-event"><strong>{item.reason}</strong><span>{new Date(item.created_at).toLocaleDateString()} · {item.previous_score} → {item.new_score} points</span></div><span className={`score-change ${item.score_change > 0 ? 'change-positive' : item.score_change < 0 ? 'change-negative' : 'change-neutral'}`}>{item.score_change > 0 ? '+' : ''}{item.score_change}<small>points</small></span></li>)}
        </ol>}
      </section>
    </div>
  );
}
