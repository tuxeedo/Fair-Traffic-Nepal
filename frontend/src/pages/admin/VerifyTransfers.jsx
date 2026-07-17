import { useState, useEffect } from 'react';
import { vehiclesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VerifyTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPending = async () => {
    try {
      const res = await vehiclesAPI.pendingTransfers();
      setTransfers(res.data.results || res.data);
    } catch (e) {
      showToast('Failed to load pending transfers', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await vehiclesAPI.approveTransfer(id);
      
      showToast(`Transfer ${action}d successfully`, 'success');
      fetchPending();
    } catch (e) {
      showToast(`Failed to ${action} transfer`, 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Verify Ownership Transfers</h1>
        <p className="page-subtitle">Review pending vehicle transfer requests</p>
      </div>

      {loading ? <div className="skeleton" style={{ height: 200 }} /> : transfers.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-text">No pending transfers</div></div>
      ) : (
        <div className="grid-cards">
          {transfers.map(t => (
            <div key={t.id} className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>{t.vehicle_number}</span>
                <span className="badge badge-pending">Pending</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <div><strong>From:</strong> {t.previous_owner_name}</div>
                <div><strong>To:</strong> {t.new_owner_name}</div>
                <div><strong>Requested:</strong> {new Date(t.transfer_date).toLocaleDateString()}</div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: 16 }}>
                <button className="btn btn-success btn-sm" style={{flex: 1}} onClick={() => handleAction(t.id, 'approve')}>Approve Transfer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
