import { useState } from 'react';
import { vehiclesAPI } from '../../services/api';

export default function SearchVehicle() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { const res = await vehiclesAPI.search({ search: query }); setResults(res.data.results || []); } catch {} setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Search Vehicle</h1><p className="page-subtitle">Find vehicles by registration number</p></div>
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <input className="form-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter registration number..." style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        </form>
      </div>
      {results.length > 0 && (
        <div className="grid-cards">
          {results.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary-light)', marginBottom: 8 }}>{v.registration_number}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div>Owner: <strong>{v.owner_name}</strong></div>
                <div>Type: {v.vehicle_type}</div>
                <div>{v.make} {v.model} {v.year && `(${v.year})`}</div>
                {v.color && <div>Color: {v.color}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
