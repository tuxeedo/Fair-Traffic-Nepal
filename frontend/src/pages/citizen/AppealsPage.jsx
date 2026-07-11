import { useState, useEffect } from 'react';
import { appealsAPI, violationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ violation: '', reason: '' });
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([appealsAPI.my(), violationsAPI.my()])
      .then(([a, v]) => { setAppeals(a.data.results || []); setViolations((v.data.results || []).filter(x => x.action_taken === 'fine' && !x.is_paid)); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await appealsAPI.submit({ violation: parseInt(form.violation), reason: form.reason });
      showToast('Appeal submitted!'); setShowForm(false); setForm({ violation: '', reason: '' });
      const res = await appealsAPI.my(); setAppeals(res.data.results || []);
    } catch (err) { showToast(err.response?.data?.violation?.[0] || 'Failed to submit', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">My Appeals</h1><p className="page-subtitle">Appeal traffic violations</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Submit Appeal'}</button>
      </div>
      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Violation</label>
              <select className="form-input form-select" value={form.violation} onChange={e => setForm({...form, violation: e.target.value})} required>
                <option value="">Select violation to appeal...</option>
                {violations.map(v => <option key={v.id} value={v.id}>#{v.id} - {v.violation_type_name} (NPR {v.fine_amount})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Appeal</label>
              <textarea className="form-input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Explain why you believe this violation should be reconsidered..." required />
            </div>
            <button type="submit" className="btn btn-primary">Submit Appeal</button>
          </form>
        </div>
      )}
      {loading ? <div className="skeleton" style={{ height: 200 }} /> : appeals.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📝</div><div className="empty-state-text">No appeals submitted</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {appeals.map(a => (
            <div key={a.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{a.violation_type} — NPR {a.fine_amount}</span>
                <span className={`badge badge-${a.status === 'accepted' ? 'success' : a.status === 'rejected' ? 'rejected' : 'pending'}`}>{a.status}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{a.reason}</div>
              {a.admin_remarks && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: 8, background: 'rgba(15,23,42,0.5)', borderRadius: 6, marginTop: 8 }}>Admin: {a.admin_remarks}</div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Submitted: {new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
