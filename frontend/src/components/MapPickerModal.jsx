import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

function MapEvents({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPickerModal({ isOpen, onClose, onSelect, initialLat, initialLng }) {
  const [lat, setLat] = useState(initialLat || 27.7172);
  const [lng, setLng] = useState(initialLng || 85.3240);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  if (!isOpen) return null;

  const handleMapClick = (clickLat, clickLng) => {
    setLat(clickLat);
    setLng(clickLng);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 1,
        },
      });
      if (response.data && response.data.length > 0) {
        const first = response.data[0];
        const searchLat = parseFloat(first.lat);
        const searchLng = parseFloat(first.lon);
        setLat(searchLat);
        setLng(searchLng);
        if (mapInstance) {
          mapInstance.setView([searchLat, searchLng], 15);
        }
      } else {
        alert('No location found.');
      }
    } catch (err) {
      console.error(err);
      alert('Geocoding search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelect(lat.toFixed(7), lng.toFixed(7));
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16
    }}>
      <div className="glass-card animate-slide-up" style={{
        width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column',
        height: '90vh', maxHeight: 600, padding: 24, gap: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Select Location on Map</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '1.2rem', padding: 0 }}>✕</button>
        </div>

        {/* Nominatim Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search city, street or location name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searching}
          />
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div style={{ flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={setMapInstance}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <Marker position={[lat, lng]} />
            <MapEvents onClick={handleMapClick} />
          </MapContainer>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Selected Coordinates:</strong> {lat.toFixed(7)}, {lng.toFixed(7)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirm}>Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>
  );
}
