import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import VehicleIdentifierInput from '../../components/VehicleIdentifierInput';
import EmptyState from '../../components/EmptyState';
import { IconCar } from '../../components/Icons';
import { vehicleIdentifierErrors, normalizedVehicleIdentifiers } from '../../utils/vehicleIdentifiers';

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editForm, setEditForm] = useState({
    registration_number: '', vehicle_type: 'motorcycle', brand: '', model: '',
    registration_date: '', color: '', bluebook_number: ''
  });
  const [editFiles, setEditFiles] = useState({ bluebook_front_image: null, bluebook_back_image: null });
  
  const [form, setForm] = useState({ 
    registration_number: '', vehicle_type: 'motorcycle', brand: '', model: '', 
    registration_date: '', color: '', bluebook_number: '' 
  });
  const [files, setFiles] = useState({ bluebook_front_image: null, bluebook_back_image: null });
  
  const { showToast } = useToast();

  const fetchVehicles = async () => {
    try { 
      const res = await vehiclesAPI.myVehicles(); 
      setVehicles(res.data.results || (Array.isArray(res.data) ? res.data : []));
      setLoadError(false);
    } catch (e) {
        setLoadError(true);
        showToast('Failed to load vehicles', 'error');
    }
    setLoading(false);
  };
  
  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = vehicleIdentifierErrors(form);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData();
    const values = { ...form, ...normalizedVehicleIdentifiers(form) };
    Object.keys(values).forEach(key => {
        if(values[key]) formData.append(key, values[key]);
    });
    if (files.bluebook_front_image) formData.append('bluebook_front_image', files.bluebook_front_image);
    if (files.bluebook_back_image) formData.append('bluebook_back_image', files.bluebook_back_image);
    
    try { 
      await vehiclesAPI.addVehicle(formData); 
      showToast('Vehicle added successfully. Pending verification.', 'success'); 
      setShowForm(false); 
      setForm({ registration_number: '', vehicle_type: 'motorcycle', brand: '', model: '', registration_date: '', color: '', bluebook_number: '' }); 
      setFiles({ bluebook_front_image: null, bluebook_back_image: null });
      fetchVehicles(); 
    } catch (err) { 
      const data = err.response?.data || {};
      setFormErrors({ registration_number: data.registration_number?.[0], bluebook_number: data.bluebook_number?.[0] });
      showToast(data.registration_number?.[0] || data.bluebook_number?.[0] || 'Failed to add vehicle', 'error');
    } finally { setSubmitting(false); }
  };

  const startEditing = (v) => {
    setEditErrors({});
    setEditingVehicleId(v.id);
    setEditForm({
      registration_number: v.registration_number || '',
      vehicle_type: v.vehicle_type || 'motorcycle',
      brand: v.brand || '',
      model: v.model || '',
      registration_date: v.registration_date || '',
      color: v.color || '',
      bluebook_number: v.bluebook_number || ''
    });
    setEditFiles({ bluebook_front_image: null, bluebook_back_image: null });
  };

  const handleUpdateSubmit = async (e, id) => {
    e.preventDefault();
    const original = vehicles.find(vehicle => vehicle.id === id) || {};
    const errors = vehicleIdentifierErrors(editForm, original);
    setEditErrors(errors);
    if (Object.keys(errors).length) return;
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData();
    const values = { ...editForm, ...normalizedVehicleIdentifiers(editForm, original) };
    Object.keys(values).forEach(key => {
      if (values[key]) formData.append(key, values[key]);
    });
    if (editFiles.bluebook_front_image) formData.append('bluebook_front_image', editFiles.bluebook_front_image);
    if (editFiles.bluebook_back_image) formData.append('bluebook_back_image', editFiles.bluebook_back_image);

    try {
      await vehiclesAPI.updateVehicle(id, formData);
      showToast('Vehicle details updated and resubmitted for verification.', 'success');
      setEditingVehicleId(null);
      fetchVehicles();
    } catch (err) {
      const data = err.response?.data || {};
      setEditErrors({ registration_number: data.registration_number?.[0], bluebook_number: data.bluebook_number?.[0] });
      showToast(data.detail || data.registration_number?.[0] || data.bluebook_number?.[0] || 'Failed to update vehicle', 'error');
    } finally { setSubmitting(false); }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'Verified': return <span className="badge badge-success">Verified</span>;
          case 'Pending': return <span className="badge badge-pending">Pending Review</span>;
          case 'Rejected': return <span className="badge badge-rejected">Rejected</span>;
          case 'Info_Requested': return <span className="badge badge-warning">Needs Info</span>;
          default: return null;
      }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">My Vehicles</h1><p className="page-subtitle">Manage your registered vehicles and ownership</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Vehicle'}</button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Register New Vehicle</h3>
          <form onSubmit={handleSubmit}>
            <div className="vehicle-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { name: 'registration_number', label: 'Registration Number', required: true },
                { name: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: ['motorcycle','scooter','car','jeep','van','bus','truck','tempo','auto_rickshaw','other'] },
                { name: 'brand', label: 'Brand / Manufacturer', required: true },
                { name: 'model', label: 'Model', required: true },
                { name: 'registration_date', label: 'Registration Date', type: 'date', required: true },
                { name: 'color', label: 'Color' },
                { name: 'bluebook_number', label: 'Bluebook Number', required: true },
              ].map(f => ['registration_number', 'bluebook_number'].includes(f.name) ? (
                <VehicleIdentifierInput key={f.name} id={`add-${f.name}`} name={f.name} value={form[f.name]} error={formErrors[f.name]} onChange={value => { setForm({...form, [f.name]: value}); setFormErrors(previous => ({...previous, [f.name]: undefined})); }} />
              ) : (
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
              
              <div className="form-group">
                  <label className="form-label">Bluebook Front Image</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setFiles({...files, bluebook_front_image: e.target.files[0]})} required />
              </div>
              <div className="form-group">
                  <label className="form-label">Bluebook Back Image</label>
                  <input type="file" className="form-input" accept="image/*" onChange={e => setFiles({...files, bluebook_back_image: e.target.files[0]})} required />
              </div>
            </div>
            <div style={{marginTop: '20px'}}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit for Verification'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : loadError ? (
        <EmptyState kind="vehicle" label="My vehicles" title="Vehicles couldn’t be loaded" description="Try again to view your registrations." error action={<button className="btn btn-primary" onClick={fetchVehicles}>Try again</button>} />
      ) : vehicles.length === 0 ? (
        <EmptyState kind="vehicle" label="Your garage" title="Your vehicles belong here" description="Add your vehicle and bluebook details to keep your registration and verification status in one place." action={!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}><IconCar size={17} />Add your first vehicle</button>} />
      ) : (
        <>
        <div className="records-overview-strip"><div><strong>{vehicles.length}</strong><span>Loaded vehicles</span></div><div><strong>{vehicles.filter(v => v.verification_status === 'Verified').length}</strong><span>Verified</span></div><div><strong>{vehicles.filter(v => v.verification_status !== 'Verified').length}</strong><span>Awaiting verification</span></div></div>
        <div className="grid-cards">
          {vehicles.map(v => (
            <div key={v.id} className="glass-card vehicle-record-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="vehicle-record-heading">
                <span className="record-symbol"><IconCar size={24} /></span>
                {getStatusBadge(v.verification_status)}
              </div>
              <div className="vehicle-record-plate"><span>Vehicle registration</span><strong>{v.registration_number}</strong></div>

              {editingVehicleId === v.id ? (
                <form onSubmit={(e) => handleUpdateSubmit(e, v.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <div className="vehicle-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <VehicleIdentifierInput id={`edit-${v.id}-registration`} name="registration_number" value={editForm.registration_number} originalValue={v.registration_number} error={editErrors.registration_number} onChange={value => { setEditForm({...editForm, registration_number: value}); setEditErrors(previous => ({...previous, registration_number: undefined})); }} />
                    <div className="form-group">
                      <label className="form-label">Vehicle Type</label>
                      <select className="form-input form-select" value={editForm.vehicle_type} onChange={e => setEditForm({...editForm, vehicle_type: e.target.value})}>
                        {['motorcycle','scooter','car','jeep','van','bus','truck','tempo','auto_rickshaw','other'].map(o => (
                          <option key={o} value={o}>{o.replace(/_/g,' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Brand</label>
                      <input className="form-input" type="text" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input className="form-input" type="text" value={editForm.model} onChange={e => setEditForm({...editForm, model: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reg Date</label>
                      <input className="form-input" type="date" value={editForm.registration_date} onChange={e => setEditForm({...editForm, registration_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color</label>
                      <input className="form-input" type="text" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} />
                    </div>
                    <VehicleIdentifierInput id={`edit-${v.id}-bluebook`} name="bluebook_number" value={editForm.bluebook_number} originalValue={v.bluebook_number} error={editErrors.bluebook_number} onChange={value => { setEditForm({...editForm, bluebook_number: value}); setEditErrors(previous => ({...previous, bluebook_number: undefined})); }} />
                    <div className="form-group">
                      <label className="form-label">Update Bluebook Front Image (Optional)</label>
                      <input type="file" className="form-input" accept="image/*" onChange={e => setEditFiles({...editFiles, bluebook_front_image: e.target.files[0]})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Update Bluebook Back Image (Optional)</label>
                      <input type="file" className="form-input" accept="image/*" onChange={e => setEditFiles({...editFiles, bluebook_back_image: e.target.files[0]})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={submitting}>{submitting ? 'Saving…' : 'Save & Resubmit'}</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingVehicleId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="vehicle-record-details" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <div style={{marginBottom: 4}}><strong>Brand:</strong> {v.brand} {v.model}</div>
                    <div style={{marginBottom: 4}}><strong>Type:</strong> <span style={{textTransform:'capitalize'}}>{v.vehicle_type}</span></div>
                    {v.color && <div style={{marginBottom: 4}}><strong>Color:</strong> {v.color}</div>}
                    {v.bluebook_number && <div><strong>Bluebook:</strong> {v.bluebook_number}</div>}
                  </div>

                  {v.verification_status !== 'Verified' && (
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => startEditing(v)}>
                        {v.verification_status === 'Info_Requested' ? '✏️ Provide Info & Resubmit' : '✏️ Edit Details'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
