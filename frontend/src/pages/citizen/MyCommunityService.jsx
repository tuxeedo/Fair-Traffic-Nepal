import EmptyState from '../../components/EmptyState';
import CommunityServiceCard from '../../components/CommunityServiceCard';
import { useState, useEffect } from 'react';
import { communityServiceAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MyCommunityService() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await communityServiceAPI.myService();
        setServices(res.data.results || (Array.isArray(res.data) ? res.data : []));
        setError(false);
      } catch (err) {
        setError(true);
        showToast('Failed to load community service tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Community Service</h1>
        <p className="page-subtitle">Track your assigned community service hours</p>
      </div>

      {loading ? <div className="skeleton" role="status" aria-label="Loading community service" style={{ height: 280 }} /> : error ? (
        <EmptyState kind="service" label="Community service" title="Tasks couldn’t be loaded" description="Please refresh this page to try again." error />
      ) : services.length === 0 ? (
        <EmptyState kind="service" label="Community service" title="No tasks assigned" description="If community service is assigned to you, you’ll find your tasks, required hours, and progress here." />
      ) : <>
        <div className="records-overview-strip"><div><strong>{services.length}</strong><span>Loaded assignments</span></div><div><strong>{services.filter(s => s.status === 'completed').length}</strong><span>Completed</span></div><div><strong>{services.filter(s => s.status !== 'completed').length}</strong><span>In progress or pending</span></div></div>
        <div className="grid-cards">{services.map(service => <CommunityServiceCard key={service.id} service={service} />)}</div>
      </>}
    </div>
  );
}
