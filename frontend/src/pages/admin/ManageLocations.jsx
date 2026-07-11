import { useState, useEffect } from 'react';
import { locationsAPI } from '../../services/api';

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { locationsAPI.all().then(res => setLocations(res.data.results || res.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

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
      <div className="page-header"><h1 className="page-title">Manage Locations</h1><p className="page-subtitle">All map locations</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Source</th><th>Active</th><th>Added By</th><th>Coordinates</th><th>Accidents Nearby</th></tr></thead>
            <tbody>{locations.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.name}</td>
                <td><span className="badge badge-info">{l.location_type.replace(/_/g,' ')}</span></td>
                <td>{l.source}</td>
                <td><span className={`badge badge-${l.is_active ? 'success' : 'rejected'}`}>{l.is_active ? 'Yes' : 'No'}</span></td>
                <td>{l.added_by_name || '-'}</td>
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
      )}
    </div>
  );
}
