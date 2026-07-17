import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const NAV_ITEMS = {
  citizen: [
    { path: '/citizen/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/citizen/vehicles', icon: '🚗', label: 'My Vehicles' },
    { path: '/citizen/violations', icon: '📋', label: 'Violations' },
    { path: '/citizen/warnings', icon: '⚠️', label: 'Warnings' },
    { path: '/citizen/safety-score', icon: '🛡️', label: 'Safety Score' },
    { path: '/citizen/appeals', icon: '📝', label: 'Appeals' },
    { path: '/citizen/map', icon: '🗺️', label: 'Traffic Map' },
    { path: '/citizen/reports', icon: '📢', label: 'Reports' },
    { path: '/citizen/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/citizen/complaints', icon: '🛡️', label: 'Officer Complaints' },
    { path: '/citizen/community-service', icon: '🧹', label: 'Community Service' },
  ],
  officer: [
    { path: '/officer/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/officer/search-driver', icon: '🔍', label: 'Search Driver' },
    { path: '/officer/search-vehicle', icon: '🚙', label: 'Search Vehicle' },
    { path: '/officer/record-violation', icon: '📝', label: 'Record Violation' },
    { path: '/officer/locations', icon: '📍', label: 'Map Locations' },
    { path: '/officer/reports', icon: '📢', label: 'Verify Reports' },
    { path: '/officer/stats', icon: '📈', label: 'My Stats' },
    { path: '/officer/community-service', icon: '🧹', label: 'Community Service' },
  ],
  admin: [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/officers', icon: '👮', label: 'Officers' },
    { path: '/admin/violations', icon: '📋', label: 'Violations' },
    { path: '/admin/rules', icon: '⚙️', label: 'Traffic Rules' },
    { path: '/admin/appeals', icon: '📝', label: 'Appeals' },
    { path: '/admin/reports', icon: '📢', label: 'Reports' },
    { path: '/admin/complaints', icon: '🛡️', label: 'Complaints' },
    { path: '/admin/locations', icon: '📍', label: 'Locations' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/heatmap', icon: '🔥', label: 'Heatmap' },
    { path: '/admin/audit', icon: '📜', label: 'Audit Log' },
    { path: '/admin/verifications', icon: '🚙', label: 'Verifications' },
    { path: '/admin/transfers', icon: '🔄', label: 'Transfers' },
    { path: '/admin/community-service', icon: '🧹', label: 'Community Service' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = NAV_ITEMS[user?.role] || [];

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.unreadCount();
        setUnreadCount(res.data.unread_count);
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 260 : 72,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 800, color: 'white', flexShrink: 0,
          }}>
            FT
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>FairTraffic</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role} Panel
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 4,
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              })}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
        }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>
          )}
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? 260 : 72,
        transition: 'margin-left 0.3s',
      }}>
        {/* Top bar */}
        <header style={{
          height: 64,
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '1.2rem', padding: 4,
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell */}
            <button
              onClick={() => navigate(`/${user?.role}/notifications`)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', position: 'relative', padding: 4,
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -6,
                  background: 'var(--color-danger)', color: 'white',
                  borderRadius: 10, padding: '1px 6px', fontSize: '0.65rem',
                  fontWeight: 700, minWidth: 16, textAlign: 'center',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', color: 'white',
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: 24 }} className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
