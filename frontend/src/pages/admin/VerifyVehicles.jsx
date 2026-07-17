import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VerifyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPending = async () => {
    try {
      const res = await vehiclesAPI.pendingVerifications();
      setVehicles(res.data.results || res.data);
    } catch (e) {
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

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : vehicles.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">No pending verifications</div></div>
      ) : (
        <div className="grid-cards">
          {vehicles.map(v => (
            <div key={v.id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>{v.registration_number}</span>
                <span className="badge badge-pending">Pending</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
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
              
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: 16 }}>
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
