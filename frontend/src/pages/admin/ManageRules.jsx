import { useState, useEffect } from 'react';
import { violationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ManageRules() {
  const [types, setTypes] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ violation_type: '', offense_number: 1, time_window_days: 180, action: 'warning', fine_amount: 0, is_immediate: false, description: '' });
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([violationsAPI.types(), violationsAPI.rules()])
      .then(([t, r]) => { setTypes(t.data.results || t.data); setRules(r.data.results || r.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await violationsAPI.createRule({ ...form, violation_type: parseInt(form.violation_type), fine_amount: parseFloat(form.fine_amount) });
      showToast('Rule created!'); setShowForm(false);
      const res = await violationsAPI.rules(); setRules(res.data.results || res.data);
    } catch (err) { showToast(err.response?.data?.non_field_errors?.[0] || 'Failed', 'error'); }
  };

  const deleteRule = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try { await violationsAPI.deleteRule(id); showToast('Rule deleted'); const res = await violationsAPI.rules(); setRules(res.data.results || res.data); }
    catch { showToast('Failed', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1 className="page-title">Traffic Rules</h1><p className="page-subtitle">Configure the rule engine policies</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Rule'}</button>
      </div>
      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
              <div className="form-group"><label className="form-label">Violation Type</label><select className="form-input form-select" value={form.violation_type} onChange={e => setForm({...form, violation_type: e.target.value})} required><option value="">Select...</option>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Offense #</label><input className="form-input" type="number" min="1" value={form.offense_number} onChange={e => setForm({...form, offense_number: parseInt(e.target.value)})} /></div>
              <div className="form-group"><label className="form-label">Time Window (days)</label><input className="form-input" type="number" value={form.time_window_days} onChange={e => setForm({...form, time_window_days: parseInt(e.target.value)})} /></div>
              <div className="form-group"><label className="form-label">Action</label><select className="form-input form-select" value={form.action} onChange={e => setForm({...form, action: e.target.value})}><option value="warning">Warning</option><option value="fine">Fine</option><option value="increased_fine">Increased Fine</option></select></div>
              <div className="form-group"><label className="form-label">Fine Amount (NPR)</label><input className="form-input" type="number" min="0" value={form.fine_amount} onChange={e => setForm({...form, fine_amount: e.target.value})} /></div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'end', paddingBottom: 20 }}><label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', cursor: 'pointer' }}><input type="checkbox" checked={form.is_immediate} onChange={e => setForm({...form, is_immediate: e.target.checked})} /> Immediate (no warnings)</label></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Create Rule</button>
          </form>
        </div>
      )}
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Violation</th><th>Offense #</th><th>Window</th><th>Action</th><th>Fine</th><th>Immediate</th><th>Description</th><th></th></tr></thead>
            <tbody>{rules.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.violation_type_name}</td>
                <td>#{r.offense_number}</td>
                <td>{r.time_window_days} days</td>
                <td><span className={`badge badge-${r.action === 'warning' ? 'warning' : 'fine'}`}>{r.action}</span></td>
                <td>{r.fine_amount > 0 ? `NPR ${r.fine_amount}` : '-'}</td>
                <td>{r.is_immediate ? <span className="badge badge-danger">Yes</span> : 'No'}</td>
                <td style={{ fontSize: '0.8rem' }}>{r.description || '-'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => deleteRule(r.id)}>Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
