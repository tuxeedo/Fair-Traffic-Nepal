import { useState } from 'react';
import { usersAPI, violationsAPI } from '../../services/api';

export default function SearchDriver() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverViolations, setDriverViolations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try { const res = await usersAPI.searchDrivers({ search: query }); setResults(res.data.results || []); } catch {} setLoading(false);
  };

  const viewHistory = async (driver) => {
    setSelectedDriver(driver);
    try { const res = await violationsAPI.driverViolations(driver.id); setDriverViolations(res.data.results || []); } catch {}
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Search Driver</h1><p className="page-subtitle">Find drivers by license number, name, or phone</p></div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <input className="form-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by license number, name, or phone..." style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </form>
      </div>
      {results.length > 0 && (
        <div className="glass-card" style={{ overflow: 'auto', marginBottom: 24 }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>License</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>{results.map(d => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.first_name} {d.last_name}</td>
                <td>{d.license_number || '-'}</td>
                <td>{d.phone || '-'}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => viewHistory(d)}>View History</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {selectedDriver && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Violation History — {selectedDriver.first_name} {selectedDriver.last_name}</h3>
          {driverViolations.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No violations found</div> : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Type</th><th>Action</th><th>Fine</th></tr></thead>
              <tbody>{driverViolations.map(v => (
                <tr key={v.id}>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td>{v.violation_type_name}</td>
                  <td><span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>{v.action_taken}</span></td>
                  <td>{v.fine_amount > 0 ? `NPR ${v.fine_amount}` : '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
