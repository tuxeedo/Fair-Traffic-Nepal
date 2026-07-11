import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ManageReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetch = () => reportsAPI.all().then(res => setReports(res.data.results || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const review = async (id, action) => {
    try { await reportsAPI.review(id, { action, review_remarks: `${action} by admin.` }); showToast(`Report ${action}`); fetch(); }
    catch { showToast('Failed', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Manage Reports</h1><p className="page-subtitle">Review community reports</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Type</th><th>Reporter</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{reports.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td><span className="badge badge-info">{r.report_type.replace(/_/g,' ')}</span></td>
                <td>{r.reporter_name}</td>
                <td><span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'rejected' : 'pending'}`}>{r.status}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {r.status === 'pending' && <>
                    <button className="btn btn-success btn-sm" onClick={() => review(r.id, 'approved')}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => review(r.id, 'rejected')}>Reject</button>
                  </>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
