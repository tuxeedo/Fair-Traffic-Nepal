import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconViolation,
  IconSearch,
  IconCar,
  IconOfficer,
  IconMapPin,
  IconShield,
  IconReport,
} from '../../components/Icons';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const badgeNumber = user?.officer_profile?.badge_number || 'N/A';
  const station = user?.officer_profile?.station || 'Central Division';
  const rank = user?.officer_profile?.rank?.replace(/_/g, ' ') || 'Traffic Officer';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          borderRadius: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Jay Nepal, {user?.first_name || user?.username}!
            </h1>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
              {rank}
            </span>
          </div>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Nepal Traffic Police Duty Control & Enforcement Portal
          </p>
        </div>

        <button
          className="btn"
          onClick={() => navigate('/officer/record-violation')}
          style={{
            background: '#4F46E5',
            color: '#ffffff',
            borderRadius: 12,
            padding: '10px 20px',
            fontWeight: 600,
            border: 'none',
          }}
        >
          <IconViolation size={18} />
          <span>Record New Violation</span>
        </button>
      </div>

      {/* Standardized Minimal Officer Stat Cards */}
      <div className="grid-stats">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">BADGE NUMBER</span>
            <IconOfficer size={20} color="var(--text-muted)" />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="stat-value">{badgeNumber}</div>
            <div className="stat-subtext" style={{ marginTop: 4 }}>
              Official Duty Badge
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">ASSIGNED STATION</span>
            <IconMapPin size={20} color="var(--text-muted)" />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              {station}
            </div>
            <div className="stat-subtext" style={{ marginTop: 4 }}>
              Command Sector
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">OFFICIAL RANK</span>
            <IconShield size={20} color="var(--text-muted)" />
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="stat-value" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {rank}
            </div>
            <div className="stat-subtext" style={{ marginTop: 4 }}>
              Nepal Police Designation
            </div>
          </div>
        </div>
      </div>

      {/* Duty Action Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14 }}>Duty Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          <div className="quick-action-card" onClick={() => navigate('/officer/record-violation')}>
            <IconViolation size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Record Violation</span>
          </div>

          <div className="quick-action-card" onClick={() => navigate('/officer/search-driver')}>
            <IconSearch size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Search Driver</span>
          </div>

          <div className="quick-action-card" onClick={() => navigate('/officer/search-vehicle')}>
            <IconCar size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Search Vehicle</span>
          </div>

          <div className="quick-action-card" onClick={() => navigate('/officer/reports')}>
            <IconReport size={22} color="var(--text-muted)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Verify Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
