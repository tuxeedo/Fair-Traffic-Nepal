import { useState, useEffect } from 'react';
import { complaintsAPI, violationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ violation: '', subject: '', description: '' });
  const [selectedOfficerName, setSelectedOfficerName] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([complaintsAPI.my(), violationsAPI.my()])
      .then(([c, v]) => {
        setComplaints(c.data.results || []);
        // Get all violations that have an associated officer
        setViolations((v.data.results || []).filter(x => x.officer));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleViolationChange = (e) => {
    const vId = e.target.value;
    setForm({ ...form, violation: vId });
    if (vId) {
      const selectedV = violations.find(x => x.id === parseInt(vId));
      setSelectedOfficerName(selectedV ? selectedV.officer_name : '');
    } else {
      setSelectedOfficerName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.violation) {
      showToast('Please select a violation/incident.', 'error');
      return;
    }
    const selectedV = violations.find(x => x.id === parseInt(form.violation));
    if (!selectedV || !selectedV.officer) {
      showToast('Cannot find investigating officer for selected violation.', 'error');
      return;
    }

    try {
      await complaintsAPI.submit({
        officer: selectedV.officer,
        violation: selectedV.id,
        subject: form.subject,
        description: form.description
      });
      showToast('Complaint submitted successfully!');
      setShowForm(false);
      setForm({ violation: '', subject: '', description: '' });
      setSelectedOfficerName('');
      const res = await complaintsAPI.my();
      setComplaints(res.data.results || []);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to submit complaint', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Officer Complaints</h1>
          <p className="page-subtitle">File a formal grievance regarding an officer's conduct during an investigation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ File Complaint'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>New Complaint Form</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Related Violation / Incident</label>
              <select
                className="form-input form-select"
                value={form.violation}
                onChange={handleViolationChange}
                required
              >
                <option value="">Select violation incident...</option>
                {violations.map(v => (
                  <option key={v.id} value={v.id}>
                    Violation #{v.id} — {v.violation_type_name} ({new Date(v.created_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedOfficerName && (
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  Investigating Officer: {selectedOfficerName}
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief summary of the issue (e.g. Unprofessional behavior)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: 120 }}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Provide a detailed description of what happened..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Complaint
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <div className="empty-state-text">No complaints filed yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{c.subject}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Officer: {c.officer_name} {c.officer_badge ? `(Badge: ${c.officer_badge})` : ''}
                  </span>
                </div>
                <span className={`badge badge-${c.status === 'resolved' ? 'success' : c.status === 'dismissed' ? 'danger' : 'pending'}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-line' }}>
                {c.description}
              </div>
              {c.admin_remarks && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: 12, background: 'rgba(15,23,42,0.5)', borderRadius: 6, marginTop: 8 }}>
                  <strong>Admin Resolution Remarks:</strong>
                  <p style={{ margin: '4px 0 0' }}>{c.admin_remarks}</p>
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Submitted: {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
