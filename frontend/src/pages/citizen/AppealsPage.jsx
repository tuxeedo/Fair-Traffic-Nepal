import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { appealsAPI, violationsAPI, evidenceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CameraCapture from '../../components/CameraCapture';

export default function AppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ violation: '', reason: '' });
  const [file, setFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const [aRes, vRes] = await Promise.all([appealsAPI.my(), violationsAPI.my()]);
      const appList = aRes.data?.results || (Array.isArray(aRes.data) ? aRes.data : []);
      const violList = vRes.data?.results || (Array.isArray(vRes.data) ? vRes.data : []);

      setAppeals(appList);

      // Create lookup map of existing appeals by violation ID
      const appealMap = {};
      appList.forEach(a => {
        const vId = typeof a.violation === 'object' ? a.violation?.id : a.violation;
        if (vId) appealMap[vId] = a;
      });

      // Filter eligible penalty violations: unpaid, action_taken !== 'warning', and
      // either no existing appeal OR appeal_count === 1 and status === 'rejected'
      const eligible = violList.filter(v => {
        if (v.action_taken === 'warning' || v.is_paid) return false;
        const existing = appealMap[v.id];
        if (!existing) return true;
        if (existing.appeal_count === 1 && existing.status === 'rejected') return true;
        return false;
      });

      setViolations(eligible);

      // Pre-select violation if passed in location state
      if (location.state?.violationId) {
        setForm(f => ({ ...f, violation: String(location.state.violationId) }));
        setShowForm(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load appeals data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.violation) {
      showToast('Please select a violation to appeal.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const violId = parseInt(form.violation, 10);
      await appealsAPI.submit({ violation: violId, reason: form.reason });

      if (file) {
        const fd = new FormData();
        fd.append('violation', violId);
        fd.append('file', file);
        fd.append('evidence_type', file.type.startsWith('video') ? 'video' : 'photo');
        await evidenceAPI.uploadCitizen(fd);
      }

      showToast('Appeal submitted successfully!');
      setShowForm(false);
      setForm({ violation: '', reason: '' });
      setFile(null);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.violation?.[0] || err.response?.data?.error || 'Failed to submit appeal';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartReappeal = (violationId) => {
    setForm({ violation: String(violationId), reason: '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Appeals</h1>
          <p className="page-subtitle">Appeal traffic violations and submit supporting evidence</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Submit Appeal'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>Submit Traffic Appeal</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Violation to Appeal</label>
              <select
                className="form-input form-select"
                value={form.violation}
                onChange={e => setForm({ ...form, violation: e.target.value })}
                required
              >
                <option value="">Select violation to appeal...</option>
                {violations.length === 0 ? (
                  <option value="" disabled>No eligible violations available to appeal</option>
                ) : (
                  violations.map(v => (
                    <option key={v.id} value={v.id}>
                      #{v.id} - {v.violation_type_name || v.violation_type?.name} {parseFloat(v.fine_amount) > 0 ? `(NPR ${v.fine_amount})` : `(${v.action_taken.replace(/_/g, ' ')})`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Appeal</label>
              <textarea
                className="form-input"
                rows={4}
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Explain why you believe this violation should be reconsidered..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supporting Evidence (Recommended for Re-Appeals)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ color: 'var(--text-secondary)', flex: 1 }}
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCameraOpen(true)}>
                  📸 Open Camera
                </button>
              </div>
              {file && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Selected: {file.name}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting || violations.length === 0}>
              {submitting ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : appeals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">No appeals submitted</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {appeals.map(a => {
            const isInitialRejected = a.appeal_count === 1 && a.status === 'rejected';
            const isFinalRejected = a.status === 'final_rejected' || (a.appeal_count >= 2 && a.status === 'rejected');
            const vId = typeof a.violation === 'object' ? a.violation?.id : a.violation;

            return (
              <div key={a.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                      Violation #{vId} — {a.violation_type} {parseFloat(a.fine_amount) > 0 ? `(NPR ${a.fine_amount})` : ''}
                    </span>
                  </div>
                  <span
                    className={`badge badge-${
                      a.status === 'accepted'
                        ? 'success'
                        : isFinalRejected
                        ? 'danger'
                        : isInitialRejected
                        ? 'warning'
                        : 'pending'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {a.status === 'accepted'
                      ? 'Accepted'
                      : isFinalRejected
                      ? 'Final Rejected'
                      : isInitialRejected
                      ? 'Initial Rejected'
                      : a.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  <strong>Reason:</strong> {a.reason}
                </div>

                {a.admin_remarks && (
                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      padding: 10,
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderLeft: '3px solid var(--color-primary)',
                      borderRadius: 6,
                      marginTop: 8,
                      marginBottom: 12,
                    }}
                  >
                    <strong>Admin Remarks:</strong> {a.admin_remarks}
                  </div>
                )}

                {/* 1st Rejection Notice & Re-Appeal Action */}
                {isInitialRejected && (
                  <div
                    style={{
                      padding: 12,
                      background: 'rgba(234, 179, 8, 0.12)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      borderRadius: 8,
                      marginTop: 12,
                      fontSize: '0.85rem',
                      color: '#fde047',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Action Required</div>
                    <div>
                      Your initial appeal was rejected. You may submit <strong>ONE final re-appeal</strong> ONLY if you have new supporting documentation (e.g., official medical emergency certificate, valid permit scan).
                    </div>
                    <button
                      className="btn btn-warning btn-sm"
                      style={{ marginTop: 10 }}
                      onClick={() => handleStartReappeal(vId)}
                    >
                      + Submit Final Re-Appeal
                    </button>
                  </div>
                )}

                {/* 2nd / Final Rejection Notice */}
                {isFinalRejected && (
                  <div
                    style={{
                      padding: 12,
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 8,
                      marginTop: 12,
                      fontSize: '0.85rem',
                      color: '#fca5a5',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>🛑 Final Appeal Decision</div>
                    <div>
                      Your final appeal has been reviewed and rejected. Please proceed to fine payment to avoid penalties, or visit the central traffic office for judicial hearing. Online appeal options are permanently disabled for this violation.
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
                  Submitted: {new Date(a.created_at).toLocaleDateString()} | Appeal Round: {a.appeal_count || 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={f => {
          setFile(f);
          showToast('Photo captured successfully!');
        }}
      />
    </div>
  );
}
