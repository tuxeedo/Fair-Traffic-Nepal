import { useState, useEffect } from 'react';
import { usersAPI, analyticsAPI } from '../../services/api';

export default function ManageOfficers() {
  const [officers, setOfficers] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.officers(), analyticsAPI.officerPerformance()])
      .then(([o, p]) => { setOfficers(o.data.results || []); setPerformance(p.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getPerf = (id) => performance.find(p => p.officer_id === id) || {};

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Manage Officers</h1><p className="page-subtitle">Officer profiles and performance</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Officer</th><th>Badge</th><th>Station</th><th>Rank</th><th>Warnings</th><th>Fines</th><th>Total</th><th>Appeals Lost</th></tr></thead>
            <tbody>{officers.map(o => {
              const p = getPerf(o.user?.id);
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.user?.first_name} {o.user?.last_name}</td>
                  <td><span className="badge badge-info">{o.badge_number}</span></td>
                  <td>{o.station}</td>
                  <td style={{ textTransform: 'capitalize' }}>{o.rank?.replace(/_/g,' ')}</td>
                  <td>{p.warnings_issued || 0}</td>
                  <td>{p.fines_issued || 0}</td>
                  <td style={{ fontWeight: 700 }}>{p.total_violations || 0}</td>
                  <td>{p.appeals_overturned || 0}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
