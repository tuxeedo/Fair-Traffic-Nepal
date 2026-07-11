import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { analyticsAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';

export default function HeatmapPage() {
  const [data, setData] = useState([]);
  useEffect(() => { analyticsAPI.heatmap().then(res => setData(res.data)).catch(() => {}); }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Violation Heatmap</h1><p className="page-subtitle">Geographic distribution of violations</p></div>
      <div className="glass-card" style={{ overflow: 'hidden', height: 'calc(100vh - 200px)' }}>
        <MapContainer center={[27.7172, 85.3240]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          {data.map((point, i) => (
            <CircleMarker key={i} center={[parseFloat(point.gps_lat), parseFloat(point.gps_lng)]}
              radius={Math.min(point.intensity * 5, 30)} fillColor="#ef4444" color="#ef4444" weight={1} opacity={0.7} fillOpacity={0.4}>
              <Popup><strong>{point.violation_type__name}</strong><br />{point.intensity} violation(s)</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
