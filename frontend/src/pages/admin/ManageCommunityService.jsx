import EmptyState from '../../components/EmptyState';
import CommunityServiceCard from '../../components/CommunityServiceCard';
import { useState, useEffect } from 'react';
import { communityServiceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ManageCommunityService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  const fetchServices = async () => {
    try {
      const res = await communityServiceAPI.allService();
      setServices(res.data.results || (Array.isArray(res.data) ? res.data : []));
        setError(false);
    } catch (err) {
      setError(true);
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

      {loading ? <div className="skeleton" role="status" aria-label="Loading community service" style={{ height: 280 }} /> : error ? (
        <EmptyState kind="service" label="Community service" title="Tasks couldn’t be loaded" description="Please refresh this page to try again." error />
      ) : services.length === 0 ? (
        <EmptyState kind="service" label="Community service" title="No assignments to review" description="Community service assignments will appear here with driver details, completed hours, and progress controls." />
      ) : <>
        <div className="records-overview-strip"><div><strong>{services.length}</strong><span>Loaded assignments</span></div><div><strong>{services.filter(s => s.status === 'completed').length}</strong><span>Completed</span></div><div><strong>{services.filter(s => s.status !== 'completed').length}</strong><span>In progress or pending</span></div></div>
        <div className="grid-cards">{services.map(service => <CommunityServiceCard key={service.id} service={service} onUpdate={handleUpdateHours} />)}</div>
      </>}
    </div>
  );
}
