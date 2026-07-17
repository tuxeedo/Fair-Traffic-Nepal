import { useState, useEffect } from 'react';
import { communityServiceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MyCommunityService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await communityServiceAPI.myService();
        setServices(res.data.results || res.data);
      } catch (err) {
        showToast('Failed to load community service tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge badge-verified">Completed</span>;
      case 'in_progress': return <span className="badge badge-pending">In Progress</span>;
      default: return <span className="badge badge-danger">Pending</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Community Service</h1>
        <p className="page-subtitle">Track your assigned community service hours</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-text">No community service tasks assigned.</div>
        </div>
      ) : (
        <div className="grid-cards">
          {services.map(service => {
            const percentage = Math.min(100, Math.round((service.completed_hours / service.assigned_hours) * 100));
            return (
              <div key={service.id} className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem' }}>{service.service_type || 'General Community Service'}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Violation: {service.violation_details} ({new Date(service.violation_date).toLocaleDateString()})
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Progress</span>
                    <span style={{ fontWeight: 600 }}>{service.completed_hours} / {service.assigned_hours} hrs</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: 10, background: 'var(--border-color)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: percentage === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                  
                  <div style={{ textAlign: 'right', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {service.assigned_hours - service.completed_hours} hours remaining
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
