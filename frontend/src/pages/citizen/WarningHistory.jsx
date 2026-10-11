import { useState, useEffect } from 'react';
import { violationsAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import { IconWarning } from '../../components/Icons';

export default function WarningHistory() {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    violationsAPI.myWarnings().then(res => setWarnings(res.data.results || (Array.isArray(res.data) ? res.data : []))).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Warning History</h1><p className="page-subtitle">Your traffic warnings</p></div>
      {loading ? <div className="skeleton" style={{height: 200}} /> : error ? (
        <EmptyState kind="warning" label="Warnings" title="Warnings couldn’t be loaded" description="Please refresh this page to try again." error />
      ) : warnings.length === 0 ? (
        <EmptyState kind="warning" label="Your driving record" title="No warnings on your record" description="Any traffic warnings will appear here with their details and acknowledgment status. Keep following the rules of the road." />
      ) : (
        <>
        <div className="records-overview-strip"><div><strong>{warnings.length}</strong><span>Loaded warnings</span></div><div><strong>{warnings.filter(w => !w.acknowledged).length}</strong><span>Pending acknowledgment</span></div><div><strong>{warnings.filter(w => w.acknowledged).length}</strong><span>Acknowledged</span></div></div>
        <div className="warning-records">
          {warnings.map(w => (
            <article key={w.id} className="glass-card warning-record-card">
              <span className="record-symbol"><IconWarning size={24} /></span>
              <div className="warning-record-copy">
                <span className="section-eyebrow">Traffic warning</span>
                <h2>{w.message}</h2>
                <p>Violation #{w.violation}{w.acknowledged_at && <> · Acknowledged {new Date(w.acknowledged_at).toLocaleDateString()}</>}</p>
              </div>
              <span className={`badge ${w.acknowledged ? 'badge-success' : 'badge-warning'}`}>
                {w.acknowledged ? 'Acknowledged' : 'Pending'}
              </span>
            </article>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
