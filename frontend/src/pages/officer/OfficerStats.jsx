import EmptyState from '../../components/EmptyState';

export default function OfficerStats() {
  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">My Statistics</h1><p className="page-subtitle">Your performance overview</p></div>
      <EmptyState kind="analytics" label="Performance overview" title="Your reports are available through your administrator" description="Performance statistics are available on the admin dashboard. Contact your administrator to view detailed reports." />
    </div>
  );
}
