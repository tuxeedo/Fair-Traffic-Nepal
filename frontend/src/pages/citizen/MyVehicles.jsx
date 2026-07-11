import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ registration_number: '', vehicle_type: 'motorcycle', make: '', model: '', year: '', color: '', bluebook_number: '' });
  const { showToast } = useToast();

  const fetchVehicles = async () => {
    try { const res = await vehiclesAPI.myVehicles(); setVehicles(res.data.results || res.data); } catch {} setLoading(false);
  };
  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await vehiclesAPI.addVehicle(form); showToast('Vehicle added!'); setShowForm(false); setForm({ registration_number: '', vehicle_type: 'motorcycle', make: '', model: '', year: '', color: '', bluebook_number: '' }); fetchVehicles(); }
    catch (err) { showToast(err.response?.data?.registration_number?.[0] || 'Failed to add vehicle', 'error'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">My Vehicles</h1><p className="page-subtitle">Manage your registered vehicles</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Vehicle'}</button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Register New Vehicle</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {[
                { name: 'registration_number', label: 'Registration Number', required: true },
                { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['motorcycle','scooter','car','jeep','van','bus','truck','tempo','auto_rickshaw','other'] },
                { name: 'make', label: 'Manufacturer', required: true },
                { name: 'model', label: 'Model', required: true },
                { name: 'year', label: 'Year', type: 'number' },
                { name: 'color', label: 'Color' },
                { name: 'bluebook_number', label: 'Bluebook Number' },
              ].map(f => (
                <div key={f.name} className="form-group">
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="form-input form-select" value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})}>
                      {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" type={f.type || 'text'} value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} required={f.required} />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">Register Vehicle</button>
          </form>
        </div>
      )}

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : vehicles.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🚗</div><div className="empty-state-text">No vehicles registered yet</div></div>
      ) : (
        <div className="grid-cards">
          {vehicles.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>{v.registration_number}</span>
                <span className="badge badge-info">{v.vehicle_type}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <div>{v.make} {v.model} {v.year && `(${v.year})`}</div>
                {v.color && <div>Color: {v.color}</div>}
                {v.bluebook_number && <div>Bluebook: {v.bluebook_number}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
