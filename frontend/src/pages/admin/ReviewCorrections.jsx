import { useState, useEffect } from 'react';
import { correctionsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ReviewCorrections() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      const res = await correctionsAPI.allCorrections(params);
      setRequests(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load correction requests:', err);
      showToast('Failed to load correction requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reqItem) => {
    if (!window.confirm(`Are you sure you want to approve updating ${reqItem.field_name_display} to "${reqItem.requested_value}" for user ${reqItem.user_details?.first_name || reqItem.user_details?.username}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await correctionsAPI.reviewCorrection(reqItem.id, { action: 'approve' });
      showToast(`Correction approved! Profile updated for ${reqItem.user_details?.first_name || 'user'}.`, 'success');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to approve request';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await correctionsAPI.reviewCorrection(selectedRequest.id, {
        action: 'reject',
        rejection_reason: rejectionReason.trim(),
      });
      showToast('Correction request rejected.', 'info');
      setRejectModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.rejection_reason?.[0] || 'Failed to reject request';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const userName = `${r.user_details?.first_name} ${r.user_details?.last_name} ${r.user_details?.username} ${r.user_details?.email}`.toLowerCase();
    const field = r.field_name_display.toLowerCase();
    const value = r.requested_value.toLowerCase();
    return userName.includes(q) || field.includes(q) || value.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>✅ Approved</span>;
      case 'Rejected':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>❌ Rejected</span>;
      default:
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>⏳ Pending Review</span>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🛡️</span> Profile Correction Verification
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Review, verify supporting identity documents, and approve or reject citizen profile correction requests.
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
        background: 'var(--bg-surface-raised)',
        padding: '14px 18px',
        borderRadius: 12,
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Pending', 'Approved', 'Rejected', 'All'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(st)}
              style={{ borderRadius: 8, fontSize: '0.85rem' }}
            >
              {st === 'Pending' ? '⏳ Pending' : st === 'Approved' ? '✅ Approved' : st === 'Rejected' ? '❌ Rejected' : '🌐 All Requests'}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by user, field, or value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Main Table / Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading profile correction requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{
          padding: 48,
          textAlign: 'center',
          background: 'var(--bg-surface-raised)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛡️</div>
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>No Correction Requests Found</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            There are currently no requests matching the filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>User</th>
                <th style={{ padding: '12px 16px' }}>Target Field</th>
                <th style={{ padding: '12px 16px' }}>Current Value</th>
                <th style={{ padding: '12px 16px' }}>Requested Value</th>
                <th style={{ padding: '12px 16px' }}>Document</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.user_details?.first_name} {item.user_details?.last_name || item.user_details?.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user_details?.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-primary-light)' }}>
                    {item.field_name_display}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {item.current_value || '(Blank)'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38bdf8' }}>
                    {item.requested_value}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {item.supporting_document ? (
                      <a
                        href={item.supporting_document}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.78rem', color: 'var(--color-accent-light)' }}
                      >
                        📄 View Document
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No doc</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {getStatusBadge(item.status)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSelectedRequest(item)}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      🔍 Inspect Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Request Details Modal */}
      {selectedRequest && !rejectModalOpen && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                🛡️ Inspection: Correction Request #{selectedRequest.id}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRequest(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* User Banner */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface-raised)', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {selectedRequest.user_details?.first_name} {selectedRequest.user_details?.last_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Username: {selectedRequest.user_details?.username} • {selectedRequest.user_details?.email}
                  </div>
                </div>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Values Comparison Card */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Target Field</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '0.95rem', marginTop: 2 }}>
                    {selectedRequest.field_name_display}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Submission Date</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>Original / Current Value</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 4, fontWeight: 600 }}>
                        {selectedRequest.current_value || '(Blank / Not Set)'}
                      </div>
                    </div>

                    <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 8, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Requested New Value</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 4, fontWeight: 700 }}>
                        {selectedRequest.requested_value}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Citizen's Explanation for Correction</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Supporting Proof Document */}
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supporting Document Attachment</label>
                {selectedRequest.supporting_document ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>📄 Supporting Proof Document attached</span>
                    <a
                      href={selectedRequest.supporting_document}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}
                    >
                      🔗 Open Document File
                    </a>
                  </div>
                ) : (
                  <div style={{ padding: '10px 14px', background: 'var(--bg-surface-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                    No supporting proof document uploaded for this request.
                  </div>
                )}
              </div>

              {/* Review Audit info if already processed */}
              {selectedRequest.status !== 'Pending' && (
                <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div>Reviewed By: <strong>{selectedRequest.reviewed_by_name || 'Admin'}</strong></div>
                  <div>Reviewed Date: {new Date(selectedRequest.reviewed_at).toLocaleString()}</div>
                  {selectedRequest.rejection_reason && (
                    <div style={{ color: '#f87171', marginTop: 4 }}>
                      Rejection Reason: {selectedRequest.rejection_reason}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons for Pending Items */}
              {selectedRequest.status === 'Pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    style={{ color: '#f87171' }}
                  >
                    ❌ Reject Request
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Approving...' : '✅ Approve & Update Profile'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalOpen && selectedRequest && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#f87171' }}>
              ❌ Reject Correction Request
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Provide a clear reason why the correction request for <strong>{selectedRequest.field_name_display}</strong> is being rejected. This explanation will be sent to the citizen.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Uploaded document is unclear or name does not match government record..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setRejectModalOpen(false)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--color-danger)' }} disabled={actionLoading}>
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
