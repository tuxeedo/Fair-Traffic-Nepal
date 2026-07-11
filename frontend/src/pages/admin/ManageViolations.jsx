import { useState, useEffect } from 'react';
import { violationsAPI } from '../../services/api';

export default function ManageViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { violationsAPI.all().then(res => setViolations(res.data.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">All Violations</h1><p className="page-subtitle">System-wide violation records</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Date</th><th>Driver</th><th>Violation</th><th>Action</th><th>Fine</th><th>Paid</th><th>Officer</th><th>Location</th></tr></thead>
            <tbody>{violations.map(v => (
              <tr key={v.id}>
                <td>#{v.id}</td>
                <td>{new Date(v.created_at).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>{v.driver_name}</td>
                <td>{v.violation_type_name}</td>
                <td><span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>{v.action_taken}</span></td>
                <td>{v.fine_amount > 0 ? `NPR ${v.fine_amount}` : '-'}</td>
                <td>{v.action_taken === 'fine' ? <span className={`badge badge-${v.is_paid ? 'success' : 'danger'}`}>{v.is_paid ? 'Yes' : 'No'}</span> : '-'}</td>
                <td>{v.officer_name}</td>
                <td style={{ fontSize: '0.8rem' }}>{v.location_description || '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
