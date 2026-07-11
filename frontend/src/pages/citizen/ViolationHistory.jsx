import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { violationsAPI } from '../../services/api';

export default function ViolationHistory() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    violationsAPI.my().then(res => setViolations(res.data.results || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Violation History</h1><p className="page-subtitle">All your traffic violations</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : violations.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">No violations! Keep up the good driving.</div></div>
      ) : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Violation</th><th>Category</th><th>Action</th><th>Fine</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id}>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v.violation_type_name}</td>
                  <td><span className={`badge badge-${v.violation_category === 'dangerous' ? 'danger' : v.violation_category === 'major' ? 'warning' : 'info'}`}>{v.violation_category}</span></td>
                  <td><span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>{v.action_taken}</span></td>
                  <td>{v.action_taken === 'fine' ? `NPR ${v.fine_amount}` : '-'}</td>
                  <td>{v.action_taken === 'fine' ? (v.is_paid ? <span className="badge badge-success">Paid</span> : <span className="badge badge-danger">Unpaid</span>) : <span className="badge badge-info">N/A</span>}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    {v.action_taken === 'fine' && !v.is_paid && <button className="btn btn-success btn-sm" onClick={() => navigate(`/citizen/pay/${v.id}`)}>Pay</button>}
                    {v.action_taken === 'fine' && <button className="btn btn-ghost btn-sm" onClick={() => navigate('/citizen/appeals', { state: { violationId: v.id } })}>Appeal</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
