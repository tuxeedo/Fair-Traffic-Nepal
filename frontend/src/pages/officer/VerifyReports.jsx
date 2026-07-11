import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VerifyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetch = () => reportsAPI.all({ status: 'pending' }).then(res => setReports(res.data.results || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const review = async (id, action) => {
    try { await reportsAPI.review(id, { action, review_remarks: action === 'approved' ? 'Verified by officer.' : 'Report not verified.' }); showToast(`Report ${action}`); fetch(); }
    catch { showToast('Failed', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Verify Reports</h1><p className="page-subtitle">Review community-submitted reports</p></div>
      {loading ? <div className="skeleton" style={{ height: 200 }} /> : reports.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">No pending reports</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div><span style={{ fontWeight: 700 }}>{r.title}</span><span className="badge badge-info" style={{ marginLeft: 8 }}>{r.report_type.replace(/_/g,' ')}</span></div>
                <span className="badge badge-pending">{r.status}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{r.description}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>By: {r.reporter_name} | {r.address || `${r.gps_lat}, ${r.gps_lng}`}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success btn-sm" onClick={() => review(r.id, 'approved')}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => review(r.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
