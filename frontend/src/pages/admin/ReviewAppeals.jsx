import { useState, useEffect } from 'react';
import { appealsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const { showToast } = useToast();

  const fetch = () =>
    appealsAPI
      .all()
      .then(res => setAppeals(res.data.results || (Array.isArray(res.data) ? res.data : [])))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    fetch();
  }, []);

  const review = async (id, action) => {
    try {
      await appealsAPI.review(id, { action, admin_remarks: remarks });
      showToast(`Appeal ${action}`);
      setReviewingId(null);
      setRemarks('');
      fetch();
    } catch {
      showToast('Failed to process review', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Review Appeals</h1>
        <p className="page-subtitle">Accept or reject citizen violation appeals</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : appeals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">No appeals found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appeals.map(a => {
            const isReappeal = a.reviewed_at !== null || a.appeal_count > 1;
            const isFinal = a.status === 'final_rejected' || (a.appeal_count >= 2 && a.status === 'rejected');

            return (
              <div key={a.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>Appeal #{a.id}</span> by <strong>{a.citizen_name}</strong>
                    {isReappeal && a.status === 'pending' && (
                      <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                        🔄 2nd Submission (Re-Appeal)
                      </span>
                    )}
                  </div>
                  <span
                    className={`badge badge-${
                      a.status === 'accepted'
                        ? 'success'
                        : isFinal
                        ? 'danger'
                        : a.status === 'rejected'
                        ? 'rejected'
                        : 'pending'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {a.status === 'accepted'
                      ? 'Accepted'
                      : isFinal
                      ? 'Final Rejected'
                      : a.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <strong>Violation:</strong> {a.violation_type} — NPR {a.fine_amount}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <strong>Reason:</strong> {a.reason}
                </div>

                {a.admin_remarks && (
                  <div
                    style={{
                      fontSize: '0.8rem',
                      padding: 8,
                      background: 'rgba(15,23,42,0.5)',
                      borderRadius: 6,
                      marginTop: 8,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <strong>Previous Admin Remarks:</strong> {a.admin_remarks}
                  </div>
                )}

                {(a.status === 'pending' || a.status === 'under_review') && (
                  reviewingId === a.id ? (
                    <div style={{ marginTop: 12 }}>
                      <textarea
                        className="form-input"
                        placeholder={
                          isReappeal
                            ? "Enter remarks for 2nd / final decision (Note: Rejection will mark as Final Rejected)..."
                            : "Enter remarks for initial decision..."
                        }
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-success btn-sm" onClick={() => review(a.id, 'accepted')}>
                          Accept Appeal
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => review(a.id, 'rejected')}>
                          {isReappeal ? 'Final Reject' : 'Reject Appeal'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setReviewingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: 12 }}
                      onClick={() => setReviewingId(a.id)}
                    >
                      Review {isReappeal ? 'Re-Appeal' : 'Appeal'}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
