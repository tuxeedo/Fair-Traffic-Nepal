import { useState, useEffect } from 'react';
import { violationsAPI, evidenceAPI } from '../../services/api';

export default function ManageViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  useEffect(() => {
    violationsAPI.all()
      .then(res => setViolations(res.data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewEvidence = async (v) => {
    setSelectedViolation(v);
    setLoadingEvidence(true);
    setEvidence([]);
    try {
      const res = await evidenceAPI.forViolation(v.id);
      setEvidence(res.data.results || res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingEvidence(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">All Violations</h1>
        <p className="page-subtitle">System-wide violation records</p>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Driver</th>
                <th>Violation</th>
                <th>Action</th>
                <th>Fine</th>
                <th>Paid</th>
                <th>Officer</th>
                <th>Location</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{v.driver_name}</td>
                  <td>{v.violation_type_name}</td>
                  <td>
                    <span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>
                      {v.action_taken}
                    </span>
                  </td>
                  <td>{v.fine_amount > 0 ? `NPR ${v.fine_amount}` : '-'}</td>
                  <td>
                    {v.action_taken === 'fine' ? (
                      <span className={`badge badge-${v.is_paid ? 'success' : 'danger'}`}>
                        {v.is_paid ? 'Yes' : 'No'}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{v.officer_name}</td>
                  <td style={{ fontSize: '0.8rem' }}>{v.location_description || '-'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewEvidence(v)}>
                      🖼️ View Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedViolation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 600, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Evidence for Violation #{selectedViolation.id}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedViolation(null)} style={{ fontSize: '1.2rem', padding: 0 }}>✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loadingEvidence ? (
                <div style={{ textAlign: 'center', padding: 20 }}>Loading files...</div>
              ) : evidence.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                  No evidence uploaded for this violation.
                </div>
              ) : (
                evidence.map((e) => {
                  const isImg = e.file.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)/);
                  return (
                    <div key={e.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                      {isImg ? (
                        <img src={e.file} alt="Evidence photo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      ) : (
                        <video src={e.file} controls style={{ width: '100%', display: 'block' }} />
                      )}
                      <div style={{ padding: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Uploaded at: {new Date(e.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setSelectedViolation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
