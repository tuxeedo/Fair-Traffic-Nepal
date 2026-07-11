import { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { auditAPI.logs().then(res => setLogs(res.data.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Audit Log</h1><p className="page-subtitle">System activity trail</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : logs.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📜</div><div className="empty-state-text">No audit logs yet</div></div>
      ) : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Model</th><th>Object</th><th>Details</th></tr></thead>
            <tbody>{logs.map(l => (
              <tr key={l.id}>
                <td style={{ fontSize: '0.8rem' }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{l.user_name}</td>
                <td><span className="badge badge-info">{l.user_role}</span></td>
                <td>{l.action}</td>
                <td>{l.model_name}</td>
                <td>#{l.object_id}</td>
                <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{JSON.stringify(l.details)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
