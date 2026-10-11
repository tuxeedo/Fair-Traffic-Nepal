import EmptyState from '../../components/EmptyState';
import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { IconCar } from '../../components/Icons';

export default function VerifyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  const fetchPending = async () => {
    try {
      const res = await vehiclesAPI.pendingVerifications();
      setVehicles(res.data.results || (Array.isArray(res.data) ? res.data : []));
      setError(false);
    } catch (e) {
      setError(true);
      showToast('Failed to load pending verifications', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await vehiclesAPI.approveVerification(id);
      else if (action === 'reject') await vehiclesAPI.rejectVerification(id);
      else if (action === 'info') await vehiclesAPI.requestInfoVerification(id);
      
      showToast(`Verification ${action}d successfully`, 'success');
      fetchPending();
    } catch (e) {
      showToast(`Failed to ${action} verification`, 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Verify Vehicles</h1>
        <p className="page-subtitle">Review pending vehicle registrations</p>
      </div>

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : error ? (
        <EmptyState kind="vehicle" label="Vehicle verification" title="Registrations couldn’t be loaded" description="Please try again to view pending registrations." error action={<button className="btn btn-primary" onClick={fetchPending}>Try again</button>} />
      ) : vehicles.length === 0 ? (
        <EmptyState kind="vehicle" label="Vehicle verification" title="No registrations awaiting review" description="New vehicle submissions will appear here with bluebook documents and verification actions." />
      ) : (
        <div className="grid-cards">
          {vehicles.map(v => (
            <div key={v.id} className="glass-card vehicle-record-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="vehicle-record-heading">
                <span className="record-symbol"><IconCar size={24} /></span>
                <span className="badge badge-pending">Pending</span>
              </div>
              <div className="vehicle-record-plate"><span>Vehicle registration</span><strong>{v.registration_number}</strong></div>
              <div className="vehicle-record-details" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <div><strong>Owner:</strong> {v.owner_name}</div>
                <div><strong>Brand:</strong> {v.brand} {v.model}</div>
                <div><strong>Bluebook:</strong> {v.bluebook_number}</div>
              </div>
              {v.documents && (
                  <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                      {v.documents.bluebook_front_image && <a href={v.documents.bluebook_front_image} target="_blank" rel="noreferrer" className="badge badge-info">Front Image</a>}
                      {v.documents.bluebook_back_image && <a href={v.documents.bluebook_back_image} target="_blank" rel="noreferrer" className="badge badge-info">Back Image</a>}
                  </div>
              )}
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto', paddingTop: 16 }}>
                <button className="btn btn-success btn-sm" style={{flex: 1}} onClick={() => handleAction(v.id, 'approve')}>Approve</button>
                <button className="btn btn-danger btn-sm" style={{flex: 1}} onClick={() => handleAction(v.id, 'reject')}>Reject</button>
                <button className="btn btn-warning btn-sm" style={{flex: 1}} onClick={() => handleAction(v.id, 'info')}>Request Info</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
