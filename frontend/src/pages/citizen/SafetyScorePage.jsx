import { useState, useEffect } from 'react';
import { violationsAPI } from '../../services/api';

export default function SafetyScorePage() {
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([violationsAPI.mySafetyScore(), violationsAPI.mySafetyHistory()])
      .then(([s, h]) => { setScore(s.data); setHistory(h.data.results || h.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const current = score?.current_score ?? 100;
  const color = current >= 80 ? 'var(--color-success)' : current >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
  const c = 2 * Math.PI * 70;
  const off = c - (current / 100) * c;

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Safety Score</h1><p className="page-subtitle">Your driving safety rating</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Score gauge */}
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div className="score-gauge" style={{ margin: '0 auto', width: 180, height: 180 }}>
            <svg className="score-gauge-circle" width="180" height="180" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border-color)" strokeWidth="10" />
              <circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="score-gauge-value">
              <span className="score-gauge-number" style={{ color }}>{current}</span>
              <span className="score-gauge-label">out of 100</span>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {current >= 80 ? 'Excellent! Keep driving safely.' : current >= 50 ? 'Fair. Be more careful on the road.' : 'Poor score. Please improve your driving habits.'}
          </div>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: 'rgba(15,23,42,0.5)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>Minor Warning: -2 pts</div>
            <div>Minor Fine: -5 pts</div>
            <div>Dangerous: -20 pts</div>
            <div>Good Behavior (1yr): +10 pts</div>
          </div>
        </div>

        {/* Score history */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Score History</h3>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-text">No score changes yet</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(h => (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 8, background: 'rgba(15,23,42,0.5)',
                  borderLeft: `3px solid ${h.score_change > 0 ? 'var(--color-success)' : 'var(--color-danger)'}`,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{h.reason}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleDateString()} - Score: {h.previous_score} &rarr; {h.new_score}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: h.score_change > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {h.score_change > 0 ? `+${h.score_change}` : h.score_change}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
