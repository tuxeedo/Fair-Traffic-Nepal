import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents } from 'react-leaflet';
import { locationsAPI, reportsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LAYER_COLORS = {
  parking: '#10b981',
  no_parking: '#ef4444',
  construction: '#f59e0b',
  diversion: '#f97316',
  accident: '#dc2626',
  traffic_light: '#6366f1',
  checkpoint: '#8b5cf6',
  hospital: '#ec4899',
  fuel_station: '#06b6d4',
};

const LAYER_ICONS = {
  parking: '🅿️',
  no_parking: '🚫',
  construction: '🚧',
  diversion: '↩️',
  accident: '💥',
  traffic_light: '🚦',
  checkpoint: '🏁',
  hospital: '🏥',
  fuel_station: '⛽',
};

// Map Report types to corresponding layer types
const CITIZEN_REPORT_TYPES = [
  { value: 'parking_suggestion', label: 'Parking Suggestion', mapTo: 'parking' },
  { value: 'road_hazard', label: 'Road Hazard', mapTo: 'construction' },
  { value: 'broken_traffic_light', label: 'Broken Traffic Light', mapTo: 'traffic_light' },
  { value: 'construction', label: 'Road Construction', mapTo: 'construction' },
  { value: 'accident', label: 'Accident Report', mapTo: 'accident' },
];

const OFFICER_LOCATION_TYPES = [
  { value: 'parking', label: 'Parking Area' },
  { value: 'no_parking', label: 'No Parking Zone' },
  { value: 'construction', label: 'Road Construction' },
  { value: 'diversion', label: 'Traffic Diversion' },
  { value: 'accident', label: 'Accident Location' },
  { value: 'traffic_light', label: 'Traffic Light' },
  { value: 'checkpoint', label: 'Checkpoint' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'fuel_station', label: 'Fuel Station' },
];

function createIcon(type) {
  return L.divIcon({
    className: '',
    html: `<div style="font-size:1.8rem;text-align:center;filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${LAYER_ICONS[type] || '📍'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function TrafficMap() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [locations, setLocations] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Picker/Form states
  const [tempMarker, setTempMarker] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', description: '' });

  const isOfficerOrAdmin = user?.role === 'officer' || user?.role === 'admin';

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

  const fetchData = async () => {
    try {
      const locRes = await locationsAPI.map();
      setLocations(locRes.data.results || locRes.data || []);
      if (user?.role === 'citizen') {
        const repRes = await reportsAPI.my();
        setReports(repRes.data.results || []);
      } else if (isOfficerOrAdmin) {
        const repRes = await reportsAPI.all();
        setReports(repRes.data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // OSM Nominatim search geocoding
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    // First search in loaded map markers
    const localMatch = locations.find(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (localMatch) {
      const searchLat = parseFloat(localMatch.gps_lat);
      const searchLng = parseFloat(localMatch.gps_lng);
      if (mapInstance) {
        mapInstance.setView([searchLat, searchLng], 16);
        showToast(`Centered on marker: ${localMatch.name}`);
      }
      setSearching(false);
      return;
    }

    // Fallback to OSM Nominatim
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: searchQuery, format: 'json', limit: 1 }
      });
      if (response.data && response.data.length > 0) {
        const first = response.data[0];
        const searchLat = parseFloat(first.lat);
        const searchLng = parseFloat(first.lon);
        if (mapInstance) {
          mapInstance.setView([searchLat, searchLng], 15);
        }
        setTempMarker({ lat: searchLat, lng: searchLng });
        setShowSubmitForm(true);
        setForm(prev => ({ ...prev, name: searchQuery }));
      } else {
        showToast('No location matches found.', 'error');
      }
    } catch {
      showToast('Search failed.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    setTempMarker({ lat, lng });
    setShowSubmitForm(true);
    // Autofill default types based on role
    setForm({
      name: '',
      type: isOfficerOrAdmin ? OFFICER_LOCATION_TYPES[0].value : CITIZEN_REPORT_TYPES[0].value,
      description: ''
    });
    showToast('Click marker placed! Fill in details to publish.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tempMarker) return;

    try {
      if (isOfficerOrAdmin) {
        // Direct publish MapLocation
        await locationsAPI.create({
          name: form.name,
          location_type: form.type,
          gps_lat: tempMarker.lat.toFixed(7),
          gps_lng: tempMarker.lng.toFixed(7),
          description: form.description
        });
        showToast('Location published successfully!');
      } else {
        // Citizen community report submission
        const fd = new FormData();
        fd.append('title', form.name);
        fd.append('report_type', form.type);
        fd.append('gps_lat', tempMarker.lat.toFixed(7));
        fd.append('gps_lng', tempMarker.lng.toFixed(7));
        fd.append('description', form.description);

        await reportsAPI.submit(fd);
        showToast('Report submitted for review!');
      }
      setShowSubmitForm(false);
      setTempMarker(null);
      setForm({ name: '', type: '', description: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to submit', 'error');
    }
  };

  // Group locations for layers
  const grouped = {};
  locations.forEach(loc => {
    if (!grouped[loc.location_type]) grouped[loc.location_type] = [];
    grouped[loc.location_type].push(loc);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Sidebar Panel */}
      <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>Interactive Map</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          {isOfficerOrAdmin ? 'Click map to publish official traffic alerts.' : 'Click map to report hazards, traffic status or suggestion.'}
        </p>

        {/* Legend */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Map Legend</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem' }}>
            {Object.entries(LAYER_ICONS).map(([type, icon]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{icon}</span>
                <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <input
            type="text"
            className="form-input form-input-sm"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, height: 36, padding: '0 12px', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={searching} style={{ height: 36 }}>
            🔍
          </button>
        </form>

        <hr style={{ borderColor: 'var(--border-color)', margin: '0 0 16px' }} />

        {/* List of Reports / Submissions */}
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
            {isOfficerOrAdmin ? 'Community Reports' : 'My Reports'}
          </h4>
          {loading ? (
            <div style={{ padding: 12, textAlign: 'center', fontSize: '0.85rem' }}>Loading reports...</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: 12, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No reports available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.slice(0, 10).map((r) => (
                <div key={r.id} style={{ padding: 10, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{r.title}</strong>
                    <span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'rejected' : 'pending'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    Type: {r.report_type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {showSubmitForm && tempMarker && (
          <div className="glass-card animate-slide-up" style={{ padding: 16, borderLeft: `4px solid var(--color-primary)` }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 12px' }}>
              {isOfficerOrAdmin ? 'Publish Official Location at clicked point' : 'Submit Community Hazard / Request'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Title / Name</label>
                <input
                  type="text"
                  className="form-input form-input-sm"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Broken Light near crossroad"
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Type</label>
                <select
                  className="form-input form-select form-input-sm"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  required
                >
                  {isOfficerOrAdmin
                    ? OFFICER_LOCATION_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
                    : CITIZEN_REPORT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)
                  }
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setShowSubmitForm(false); setTempMarker(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {isOfficerOrAdmin ? 'Publish' : 'Submit Report'}
                </button>
              </div>

              <div className="form-group" style={{ gridColumn: '1/3', margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: 4 }}>Description</label>
                <input
                  type="text"
                  className="form-input form-input-sm"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide brief details..."
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Coords: {tempMarker.lat.toFixed(5)}, {tempMarker.lng.toFixed(5)}
              </div>
            </form>
          </div>
        )}

        <div className="glass-card" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MapContainer
            center={[27.7172, 85.3240]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={setMapInstance}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapEventsHandler onMapClick={handleMapClick} />

            {/* Custom/Selected Marker Pin */}
            {tempMarker && (
              <Marker position={[tempMarker.lat, tempMarker.lng]} />
            )}

            <LayersControl position="topright">
              {Object.entries(grouped).map(([type, locs]) => (
                <LayersControl.Overlay key={type} checked name={`${LAYER_ICONS[type] || ''} ${type.replace(/_/g, ' ')}`}>
                  <>{locs.map(loc => (
                    <Marker key={loc.id} position={[parseFloat(loc.gps_lat), parseFloat(loc.gps_lng)]} icon={createIcon(loc.location_type)}>
                      <Popup>
                        <div style={{ fontSize: '0.85rem' }}>
                          <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{loc.name}</h4>
                          <p style={{ margin: '0 0 6px', color: 'var(--text-secondary)' }}>{loc.description}</p>
                          <div style={{ margin: '6px 0', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 600 }}>
                            ⚠️ Nearby Accidents: {getNearbyAccidentCount(loc.gps_lat, loc.gps_lng)}
                          </div>
                          <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--color-primary)' }}>
                            Source: {loc.source}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}</>
                </LayersControl.Overlay>
              ))}
            </LayersControl>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
