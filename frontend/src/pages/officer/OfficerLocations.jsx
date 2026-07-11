import { useState, useEffect } from 'react';
import { locationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MapPickerModal from '../../components/MapPickerModal';

const TYPES = ['parking','no_parking','construction','diversion','accident','traffic_light','checkpoint','road_closure','speed_zone'];

export default function OfficerLocations() {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location_type: 'checkpoint', gps_lat: '', gps_lng: '', description: '' });
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { locationsAPI.map().then(res => setLocations(res.data.results || res.data)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await locationsAPI.create(form); showToast('Location added!'); setShowForm(false); locationsAPI.map().then(res => setLocations(res.data.results || res.data)); } catch { showToast('Failed', 'error'); }
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm({ ...form, gps_lat: pos.coords.latitude.toFixed(7), gps_lng: pos.coords.longitude.toFixed(7) });
      showToast('Location captured!');
    }, () => showToast('Could not get location', 'error'));
  };

  const handleLocationSelect = (lat, lng) => {
    setForm({ ...form, gps_lat: lat, gps_lng: lng });
    showToast('Location selected from map!');
  };

  const getNearbyAccidentCount = (lat, lng) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return locations.filter(loc => {
      if (loc.location_type !== 'accident') return false;
      const dLat = parseFloat(loc.gps_lat) - latNum;
      const dLng = parseFloat(loc.gps_lng) - lngNum;
      return Math.sqrt(dLat * dLat + dLng * dLng) < 0.005;
    }).length;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><h1 className="page-title">Map Locations</h1><p className="page-subtitle">Manage official traffic locations</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Location'}</button>
      </div>
      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Type</label><select className="form-input form-select" value={form.location_type} onChange={e => setForm({...form, location_type: e.target.value})}>{TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}</select></div>
              <div className="form-group">
                <label className="form-label">GPS Coordinates</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Lat" value={form.gps_lat} onChange={e => setForm({...form, gps_lat: e.target.value})} required style={{ flex: 1 }} />
                  <input className="form-input" placeholder="Lng" value={form.gps_lng} onChange={e => setForm({...form, gps_lng: e.target.value})} required style={{ flex: 1 }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={getLocation} title="Use My Current Location">📍</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsMapPickerOpen(true)} title="Pick on Map">🗺️</button>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Publish Location</button>
          </form>
        </div>
      )}
      <div className="glass-card" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Type</th><th>Source</th><th>Coordinates</th><th>Accidents Nearby</th></tr></thead>
          <tbody>{locations.map(l => (
            <tr key={l.id}>
              <td style={{ fontWeight: 600 }}>{l.name}</td>
              <td><span className="badge badge-info">{l.location_type.replace(/_/g,' ')}</span></td>
              <td>{l.source}</td>
              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l.gps_lat}, {l.gps_lng}</td>
              <td>
                <span className={`badge badge-${getNearbyAccidentCount(l.gps_lat, l.gps_lng) > 0 ? 'danger' : 'success'}`}>
                  ⚠️ {getNearbyAccidentCount(l.gps_lat, l.gps_lng)}
                </span>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={handleLocationSelect}
        initialLat={parseFloat(form.gps_lat) || undefined}
        initialLng={parseFloat(form.gps_lng) || undefined}
      />
    </div>
  );
}
