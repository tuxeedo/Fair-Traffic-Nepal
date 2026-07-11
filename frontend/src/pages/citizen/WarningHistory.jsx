import { useState, useEffect } from 'react';
import { violationsAPI } from '../../services/api';

export default function WarningHistory() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    violationsAPI.myWarnings().then(res => setWarnings(res.data.results || res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Warning History</h1><p className="page-subtitle">Your traffic warnings</p></div>
      {loading ? <div className="skeleton" style={{height: 200}} /> : warnings.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">👍</div><div className="empty-state-text">No warnings issued</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {warnings.map(w => (
            <div key={w.id} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{w.message}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Violation #{w.violation}</div>
              </div>
              <span className={`badge ${w.acknowledged ? 'badge-success' : 'badge-warning'}`}>
                {w.acknowledged ? 'Acknowledged' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
