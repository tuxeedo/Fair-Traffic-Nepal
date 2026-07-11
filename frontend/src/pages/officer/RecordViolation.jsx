import { useState, useEffect } from 'react';
import { usersAPI, vehiclesAPI, violationsAPI, evidenceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MapPickerModal from '../../components/MapPickerModal';

export default function RecordViolation() {
  const [step, setStep] = useState(1);
  const [drivers, setDrivers] = useState([]);
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [types, setTypes] = useState([]);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ vehicle_id: '', violation_type_id: '', gps_lat: '', gps_lng: '', location_description: '', officer_remarks: '', override_action: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { violationsAPI.types().then(res => setTypes(res.data.results || res.data)).catch(() => {}); }, []);

  const searchDrivers = async () => {
    if (!driverSearch.trim()) return;
    const res = await usersAPI.searchDrivers({ search: driverSearch });
    setDrivers(res.data.results || []);
  };

  const selectDriver = async (driver) => {
    setSelectedDriver(driver);
    setStep(2);
    try { const res = await vehiclesAPI.byOwner(driver.id); setVehicles(res.data.results || res.data); } catch {}
  };

  const previewViolation = async () => {
    if (!form.violation_type_id) { showToast('Select a violation type', 'error'); return; }
    try {
      const res = await violationsAPI.preview({ driver_id: selectedDriver.id, violation_type_id: parseInt(form.violation_type_id) });
      setPreview(res.data);
      setStep(3);
    } catch (err) { showToast('Preview failed', 'error'); }
  };

  const handleLocationSelect = (lat, lng) => {
    setForm({ ...form, gps_lat: lat, gps_lng: lng });
    showToast('Location selected from map!');
  };

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm({ ...form, gps_lat: pos.coords.latitude.toFixed(7), gps_lng: pos.coords.longitude.toFixed(7) });
      showToast('Location captured!');
    }, () => showToast('Could not get location', 'error'));
  };

  const submitViolation = async () => {
    setLoading(true);
    try {
      const data = {
        driver_id: selectedDriver.id,
        violation_type_id: parseInt(form.violation_type_id),
        vehicle_id: form.vehicle_id ? parseInt(form.vehicle_id) : null,
        gps_lat: form.gps_lat || undefined,
        gps_lng: form.gps_lng || undefined,
        location_description: form.location_description,
        officer_remarks: form.officer_remarks,
      };
      if (form.override_action) data.override_action = form.override_action;
      const res = await violationsAPI.record(data);
      const violationId = res.data.violation.id;

      // Upload evidence files
      for (const file of files) {
        const fd = new FormData();
        fd.append('violation', violationId);
        fd.append('file', file);
        fd.append('evidence_type', file.type.startsWith('video') ? 'video' : 'photo');
        await evidenceAPI.uploadOfficer(fd);
      }

      showToast(`Violation recorded: ${res.data.message}`);
      setStep(1); setSelectedDriver(null); setPreview(null); setFiles([]);
      setForm({ vehicle_id: '', violation_type_id: '', gps_lat: '', gps_lng: '', location_description: '', officer_remarks: '', override_action: '' });
    } catch (err) { showToast(err.response?.data?.error || 'Failed to record', 'error'); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Record Violation</h1><p className="page-subtitle">Step {step} of 3</p></div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['Select Driver', 'Violation Details', 'Review & Confirm'].map((label, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: '0.8rem', fontWeight: step === i+1 ? 700 : 400, background: step === i+1 ? 'var(--color-primary)' : step > i+1 ? 'var(--color-success)' : 'var(--bg-card)', color: step >= i+1 ? 'white' : 'var(--text-muted)' }}>
            {label}
          </div>
        ))}
      </div>

      {/* Step 1: Select Driver */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input className="form-input" value={driverSearch} onChange={e => setDriverSearch(e.target.value)} placeholder="Search driver by license, name, or phone..." style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchDrivers())} />
            <button className="btn btn-primary" onClick={searchDrivers}>Search</button>
          </div>
          {drivers.length > 0 && (
            <table className="data-table">
              <thead><tr><th>Name</th><th>License</th><th>Phone</th><th></th></tr></thead>
              <tbody>{drivers.map(d => (
                <tr key={d.id}><td>{d.first_name} {d.last_name}</td><td>{d.license_number || '-'}</td><td>{d.phone || '-'}</td>
                <td><button className="btn btn-primary btn-sm" onClick={() => selectDriver(d)}>Select</button></td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* Step 2: Violation Details */}
      {step === 2 && selectedDriver && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ padding: 12, background: 'rgba(99,102,241,0.1)', borderRadius: 8, marginBottom: 20 }}>
            <strong>Driver:</strong> {selectedDriver.first_name} {selectedDriver.last_name} | <strong>License:</strong> {selectedDriver.license_number || 'N/A'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Violation Type *</label>
              <select className="form-input form-select" value={form.violation_type_id} onChange={e => setForm({...form, violation_type_id: e.target.value})} required>
                <option value="">Select violation type...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category}) — NPR {t.base_fine_amount}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <select className="form-input form-select" value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})}>
                <option value="">Select vehicle (optional)...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.make} {v.model}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GPS Location</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Lat" value={form.gps_lat} onChange={e => setForm({...form, gps_lat: e.target.value})} style={{ flex: 1 }} />
                <input className="form-input" placeholder="Lng" value={form.gps_lng} onChange={e => setForm({...form, gps_lng: e.target.value})} style={{ flex: 1 }} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={getLocation} title="Use My Current Location">📍</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsMapPickerOpen(true)} title="Pick on Map">🗺️</button>
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Location Description</label><input className="form-input" value={form.location_description} onChange={e => setForm({...form, location_description: e.target.value})} placeholder="e.g. Near Ratnapark, Kathmandu" /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Officer Remarks</label><textarea className="form-input" value={form.officer_remarks} onChange={e => setForm({...form, officer_remarks: e.target.value})} placeholder="Additional notes..." /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Evidence (Photos/Videos)</label>
              <input type="file" multiple accept="image/*,video/*" onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'var(--text-secondary)' }} />
              {files.length > 0 && <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{files.length} file(s) selected</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" onClick={previewViolation}>Preview Recommendation</button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && preview && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Rule Engine Recommendation</h3>
          <div style={{ padding: 16, background: preview.recommendation.action === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 8, borderLeft: `4px solid ${preview.recommendation.action === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'}`, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>{preview.recommendation.action}</div>
            {preview.recommendation.fine_amount > 0 && <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>NPR {preview.recommendation.fine_amount}</div>}
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>{preview.recommendation.reason}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Override Action (Optional)</label>
            <select className="form-input form-select" value={form.override_action} onChange={e => setForm({...form, override_action: e.target.value})}>
              <option value="">Use recommendation: {preview.recommendation.action}</option>
              <option value="warning">Override: Warning</option>
              <option value="fine">Override: Fine</option>
            </select>
          </div>
          {(() => {
            const currentAction = form.override_action || preview.recommendation.action;
            const isFineWithoutProof = currentAction === 'fine' && files.length === 0;
            const isVehicleMissing = currentAction === 'fine' && !form.vehicle_id;
            return (
              <>
                {isFineWithoutProof && (
                  <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)', borderRadius: 8, color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: 16 }}>
                    <strong>❌ Proof Required:</strong> You must upload a video or photo proof of the violation to issue a fine. Please go back to Step 2 and attach evidence files.
                  </div>
                )}
                {isVehicleMissing && (
                  <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--color-danger)', borderRadius: 8, color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: 16 }}>
                    <strong>❌ Vehicle Selection Required:</strong> You must select a vehicle to issue a fine. Please go back to Step 2 and select a vehicle.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn-success btn-lg" onClick={submitViolation} disabled={loading || isFineWithoutProof || isVehicleMissing}>
                    {loading ? 'Recording...' : 'Confirm & Record Violation'}
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
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
