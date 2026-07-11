import { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const { showToast } = useToast();

  const fetch = () => complaintsAPI.all()
    .then(res => setComplaints(res.data.results || []))
    .catch(() => {})
    .finally(() => setLoading(false));

  useEffect(() => { fetch(); }, []);

  const handleReview = async (id, action) => {
    if (!remarks.trim()) {
      showToast('Please provide administrative remarks.', 'error');
      return;
    }
    try {
      await complaintsAPI.review(id, { action, admin_remarks: remarks });
      showToast(`Complaint marked as ${action.replace('_', ' ')}`);
      setReviewingId(null);
      setRemarks('');
      fetch();
    } catch {
      showToast('Failed to update complaint status', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Review Complaints</h1>
        <p className="page-subtitle">Investigate, resolve, or dismiss complaints filed against officers by citizens</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <div className="empty-state-text">No complaints filed</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700 }}>Complaint #{c.id}</span> by <strong>{c.citizen_name}</strong>
                </div>
                <span className={`badge badge-${c.status === 'resolved' ? 'success' : c.status === 'dismissed' ? 'danger' : c.status === 'under_investigation' ? 'warning' : 'pending'}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <strong>Officer:</strong> {c.officer_name} {c.officer_badge ? `(Badge: ${c.officer_badge})` : ''}
              </div>
              {c.violation_details && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <strong>Incident:</strong> Violation #{c.violation} — {c.violation_details}
                </div>
              )}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 8, fontWeight: 600 }}>
                Subject: {c.subject}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'pre-line' }}>
                <strong>Details:</strong> {c.description}
              </div>

              {c.admin_remarks && (
                <div style={{ fontSize: '0.8rem', padding: 12, background: 'rgba(15,23,42,0.5)', borderRadius: 6, marginTop: 8, color: 'var(--text-muted)' }}>
                  <strong>Admin Remarks:</strong> {c.admin_remarks}
                </div>
              )}

              {c.status === 'pending' || c.status === 'under_investigation' ? (
                reviewingId === c.id ? (
                  <div style={{ marginTop: 12 }}>
                    <textarea
                      className="form-input"
                      placeholder="Enter investigation details or resolution remarks..."
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      style={{ marginBottom: 8, minHeight: 80 }}
                      required
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      {c.status === 'pending' && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleReview(c.id, 'under_investigation')}>
                          Investigate
                        </button>
                      )}
                      <button className="btn btn-success btn-sm" onClick={() => handleReview(c.id, 'resolved')}>
                        Resolve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReview(c.id, 'dismissed')}>
                        Dismiss
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setReviewingId(null); setRemarks(''); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => { setReviewingId(c.id); setRemarks(c.admin_remarks || ''); }}>
                    Review Complaint
                  </button>
                )
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
