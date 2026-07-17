import { useState, useEffect } from 'react';
import { communityServiceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ManageCommunityService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchServices = async () => {
    try {
      const res = await communityServiceAPI.allService();
      setServices(res.data.results || res.data);
    } catch (err) {
      showToast('Failed to load community service tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleUpdateHours = async (id, newHours) => {
    try {
      await communityServiceAPI.update(id, { completed_hours: newHours });
      showToast('Hours updated successfully', 'success');
      fetchServices();
    } catch (err) {
      showToast('Failed to update hours', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manage Community Service</h1>
        <p className="page-subtitle">Track and update community service for repeat offenders</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400 }} />
      ) : (
        <div className="glass-card" style={{ padding: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: 12 }}>Driver</th>
                <th style={{ padding: 12 }}>Service Type</th>
                <th style={{ padding: 12 }}>Status</th>
                <th style={{ padding: 12 }}>Progress</th>
                <th style={{ padding: 12 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: 12, fontWeight: 500 }}>{s.driver_name}</td>
                  <td style={{ padding: 12 }}>{s.service_type || 'General'}</td>
                  <td style={{ padding: 12 }}>
                    <span className={`badge badge-${s.status === 'completed' ? 'verified' : s.status === 'in_progress' ? 'pending' : 'danger'}`}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{s.completed_hours} / {s.assigned_hours} hrs</td>
                  <td style={{ padding: 12 }}>
                    {s.status !== 'completed' && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input 
                          type="number" 
                          min={s.completed_hours} 
                          max={s.assigned_hours}
                          defaultValue={s.completed_hours}
                          id={`hours-${s.id}`}
                          className="input-field"
                          style={{ width: 80, padding: '4px 8px' }}
                        />
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const val = document.getElementById(`hours-${s.id}`).value;
                            handleUpdateHours(s.id, val);
                          }}
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No community service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
