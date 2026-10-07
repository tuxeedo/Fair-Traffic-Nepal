import { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AuditLogPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.logs();
      setLogs(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (!action) return <span className="badge badge-info">system_event</span>;

    const lower = action.toLowerCase();
    if (lower.includes('approved') || lower.includes('accepted') || lower.includes('completed')) {
      return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>✅ {action}</span>;
    }
    if (lower.includes('rejected') || lower.includes('dismissed') || lower.includes('deleted')) {
      return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>❌ {action}</span>;
    }
    if (lower.includes('recorded') || lower.includes('violation') || lower.includes('warning')) {
      return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>⚠️ {action}</span>;
    }
    return <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>ℹ️ {action}</span>;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>ADMIN</span>;
      case 'officer':
        return <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>OFFICER</span>;
      case 'citizen':
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>CITIZEN</span>;
      default:
        return <span style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>SYSTEM</span>;
    }
  };

  // Get unique model names for filter dropdown
  const uniqueModels = ['All', ...Array.from(new Set(logs.map((l) => l.model_name).filter(Boolean)))];

  // Filter logs based on search query, model, and role
  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.model_name && log.model_name.toLowerCase().includes(q)) ||
      (log.object_id && String(log.object_id).toLowerCase().includes(q)) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.user_username && log.user_username.toLowerCase().includes(q)) ||
      (log.user_email && log.user_email.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(q)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(q));

    const matchesModel = modelFilter === 'All' || log.model_name === modelFilter;
    const matchesRole = roleFilter === 'All' || log.user_role === roleFilter;

    return matchesSearch && matchesModel && matchesRole;
  });

  const handleCopyJSON = (detailsObj) => {
    navigator.clipboard.writeText(JSON.stringify(detailsObj, null, 2));
    showToast('Audit payload copied to clipboard!', 'success');
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📜</span> System Audit Trail & Logs
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Immutable, full audit trail of all enforcement, administrative, verification, and user security events.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
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
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by action, user, email, object ID, IP, or payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          />
        </div>

        {/* Model Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Model:</label>
          <select
            className="form-input"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.83rem', width: 'auto' }}
          >
            {uniqueModels.map((m) => (
              <option key={m} value={m}>{m === 'All' ? 'All Models' : m}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actor Role:</label>
          <select
            className="form-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.83rem', width: 'auto' }}
          >
            <option value="All">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="officer">Traffic Officer</option>
            <option value="citizen">Citizen</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Main Audit Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading system audit logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div style={{
          padding: 48,
          textAlign: 'center',
          background: 'var(--bg-surface-raised)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📜</div>
          <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>No Audit Logs Found</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            No system audit logs match your search or filter options.
          </p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px' }}>Actor</th>
                <th style={{ padding: '12px 16px' }}>Action Executed</th>
                <th style={{ padding: '12px 16px' }}>Affected Target</th>
                <th style={{ padding: '12px 16px' }}>IP Address</th>
                <th style={{ padding: '12px 16px' }}>Metadata Payload Summary</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Timestamp */}
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  {/* Actor */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.user_name || log.user_username || 'System'}
                      </div>
                      {getRoleBadge(log.user_role)}
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 16px' }}>
                    {getActionBadge(log.action)}
                  </td>

                  {/* Affected Target */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{log.model_name}</span>
                    {log.object_id && (
                      <span style={{ marginLeft: 6, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{log.object_id}
                      </span>
                    )}
                  </td>

                  {/* IP Address */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {log.ip_address || 'Internal / Server'}
                  </td>

                  {/* Details Summary */}
                  <td style={{ padding: '12px 16px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    {log.details ? JSON.stringify(log.details) : '{}'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    >
                      🔍 Full Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Audit Detail Inspection Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>📜</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Audit Log Inspection #{selectedLog.id}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Captured at {new Date(selectedLog.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLog(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Actor Card */}
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface-raised)', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actor User</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: 2 }}>
                    {selectedLog.user_name || 'System Execution'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Username: {selectedLog.user_username || 'system'} • {selectedLog.user_email || 'System Process'}
                  </div>
                </div>
                {getRoleBadge(selectedLog.user_role)}
              </div>

              {/* Action Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14, background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action Name</div>
                  <div style={{ marginTop: 4 }}>{getActionBadge(selectedLog.action)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Model & ID</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {selectedLog.model_name} {selectedLog.object_id ? `(#${selectedLog.object_id})` : ''}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Client IP Address</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'monospace' }}>
                    🌐 {selectedLog.ip_address || 'Internal Server Action'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event Timestamp</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {new Date(selectedLog.created_at).toUTCString()}
                  </div>
                </div>
              </div>

              {/* Key-Value Parsed Details Grid */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Parsed Event Attributes</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    padding: 12,
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem'
                  }}>
                    {Object.entries(selectedLog.details).map(([key, val]) => (
                      <div key={key} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>{key}</span>
                        <strong style={{ color: 'var(--color-primary-light)', wordBreak: 'break-all' }}>
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raw JSON Payload</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCopyJSON(selectedLog.details)}
                    style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--color-primary-light)' }}
                  >
                    📋 Copy JSON
                  </button>
                </div>
                <pre style={{
                  padding: 14,
                  background: '#090d16',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  overflowX: 'auto',
                  maxHeight: 200,
                  margin: 0,
                }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedLog(null)}>
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
