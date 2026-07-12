import { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CameraCapture from '../../components/CameraCapture';

const REPORT_TYPES = ['parking_suggestion','road_hazard','broken_traffic_light','construction','accident','missing_sign','pothole','flooding','other'];

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ report_type: 'road_hazard', title: '', description: '', gps_lat: '', gps_lng: '', address: '' });
  const [file, setFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { reportsAPI.my().then(res => setReports(res.data.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    if (file) {
      formData.append('photo', file);
    }
    try {
      await reportsAPI.submit(formData); showToast('Report submitted!'); setShowForm(false); setFile(null);
      const res = await reportsAPI.my(); setReports(res.data.results || []);
    } catch (err) { showToast('Failed to submit report', 'error'); }
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm({ ...form, gps_lat: pos.coords.latitude.toFixed(7), gps_lng: pos.coords.longitude.toFixed(7) });
      showToast('Location captured!');
    }, () => showToast('Could not get location', 'error'));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">My Reports</h1><p className="page-subtitle">Community traffic reports</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Submit Report'}</button>
      </div>
      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Report Type</label>
                <select className="form-input form-select" value={form.report_type} onChange={e => setForm({...form, report_type: e.target.value})}>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Title</label>
                <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              </div>
              <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">GPS Location</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="Lat" value={form.gps_lat} onChange={e => setForm({...form, gps_lat: e.target.value})} style={{ flex: 1 }} />
                  <input className="form-input" placeholder="Lng" value={form.gps_lng} onChange={e => setForm({...form, gps_lng: e.target.value})} style={{ flex: 1 }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={getLocation}>📍</button>
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Supporting Photo / Evidence</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files[0])} style={{ color: 'var(--text-secondary)', flex: 1 }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCameraOpen(true)}>
                    📸 Open Camera
                  </button>
                </div>
                {file && <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selected: {file.name}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit Report</button>
          </form>
        </div>
      )}
      {loading ? <div className="skeleton" style={{ height: 200 }} /> : reports.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-text">No reports submitted</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map(r => (
            <div key={r.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>{r.title}</span>
                <span className={`badge badge-${r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'rejected' : 'pending'}`}>{r.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span className="badge badge-info">{r.report_type.replace(/_/g,' ')}</span></div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.description}</div>
              {r.review_remarks && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: 8, background: 'rgba(15,23,42,0.5)', borderRadius: 6, marginTop: 8 }}>Review: {r.review_remarks}</div>}
            </div>
          ))}
        </div>
      )}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(f) => { setFile(f); showToast('Photo captured successfully!'); }}
      />
    </div>
  );
}
