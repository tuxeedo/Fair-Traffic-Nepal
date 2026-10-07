import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';
import UserProfileModal from '../components/UserProfileModal';
import Logo from '../components/Logo';
import {
  IconDashboard,
  IconCar,
  IconViolation,
  IconWarning,
  IconShield,
  IconTrafficLight,
  IconAppeal,
  IconMap,
  IconReport,
  IconBell,
  IconService,
  IconSearch,
  IconOfficer,
  IconUsers,
  IconRules,
  IconAnalytics,
  IconHeatmap,
  IconAudit,
  IconShieldCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLogOut,
  IconSun,
  IconMoon,
} from '../components/Icons';

const NAV_ITEMS = {
  citizen: [
    { path: '/citizen/dashboard', icon: IconDashboard, label: 'Dashboard' },
    { path: '/citizen/vehicles', icon: IconCar, label: 'My Vehicles' },
    { path: '/citizen/violations', icon: IconViolation, label: 'Violations' },
    { path: '/citizen/warnings', icon: IconWarning, label: 'Warnings' },
    { path: '/citizen/safety-score', icon: IconShieldCheck, label: 'Safety Score' },
    { path: '/citizen/traffic-signs', icon: IconTrafficLight, label: 'Traffic Signs' },
    { path: '/citizen/appeals', icon: IconAppeal, label: 'Appeals' },
    { path: '/citizen/map', icon: IconMap, label: 'Traffic Map' },
    { path: '/citizen/reports', icon: IconReport, label: 'Reports' },
    { path: '/citizen/notifications', icon: IconBell, label: 'Notifications' },
    { path: '/citizen/complaints', icon: IconShield, label: 'Officer Complaints' },
    { path: '/citizen/community-service', icon: IconService, label: 'Community Service' },
  ],
  officer: [
    { path: '/officer/dashboard', icon: IconDashboard, label: 'Dashboard' },
    { path: '/officer/search-driver', icon: IconSearch, label: 'Search Driver' },
    { path: '/officer/search-vehicle', icon: IconCar, label: 'Search Vehicle' },
    { path: '/officer/record-violation', icon: IconViolation, label: 'Record Violation' },
    { path: '/officer/locations', icon: IconMap, label: 'Map Locations' },
    { path: '/officer/reports', icon: IconReport, label: 'Verify Reports' },
    { path: '/officer/stats', icon: IconAnalytics, label: 'My Stats' },
    { path: '/officer/notifications', icon: IconBell, label: 'Notifications' },
    { path: '/officer/community-service', icon: IconService, label: 'Community Service' },
  ],
  admin: [
    { path: '/admin/dashboard', icon: IconDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: IconUsers, label: 'Users' },
    { path: '/admin/officers', icon: IconOfficer, label: 'Officers' },
    { path: '/admin/violations', icon: IconViolation, label: 'Violations' },
    { path: '/admin/rules', icon: IconRules, label: 'Traffic Rules' },
    { path: '/admin/appeals', icon: IconAppeal, label: 'Appeals' },
    { path: '/admin/reports', icon: IconReport, label: 'Reports' },
    { path: '/admin/complaints', icon: IconShield, label: 'Complaints' },
    { path: '/admin/locations', icon: IconMap, label: 'Locations' },
    { path: '/admin/analytics', icon: IconAnalytics, label: 'Analytics' },
    { path: '/admin/heatmap', icon: IconHeatmap, label: 'Heatmap' },
    { path: '/admin/audit', icon: IconAudit, label: 'Audit Log' },
    { path: '/admin/verifications', icon: IconCar, label: 'Verifications' },
    { path: '/admin/corrections', icon: IconShieldCheck, label: 'Corrections' },
    { path: '/admin/notifications', icon: IconBell, label: 'Notifications' },
    { path: '/admin/community-service', icon: IconService, label: 'Community Service' },
  ],
};

export default function DashboardLayout() {
  const { user, logout, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme & Profile Popover state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const popoverRef = useRef(null);

  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const roleMenuRef = useRef(null);

  const navItems = NAV_ITEMS[user?.role] || [];

  // Theme Sync effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside popover to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.unreadCount();
        setUnreadCount(res.data.unread_count);
      } catch {
        /* ignore */
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setPopoverOpen(false);
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 260 : 72,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s var(--ease-out)',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Header Branding with Vector Logo */}
        <div
          style={{
            padding: '18px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            height: 64,
            position: 'relative',
          }}
          ref={roleMenuRef}
        >
          <Logo
            size={36}
            showText={sidebarOpen}
            roleText={`${user?.role || 'citizen'} Portal`}
            onLogoClick={() => {
              setRoleSwitcherOpen(false);
              navigate(`/${user?.role || 'citizen'}/dashboard`);
            }}
            canSwitchRole={user?.role === 'admin'}
            onRoleClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
          />

          {/* Role Switcher Dropdown (For multi-role admin accounts) */}
          {roleSwitcherOpen && user?.role === 'admin' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 16,
                width: 210,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 12,
                boxShadow: 'var(--shadow-modal)',
                padding: '8px 0',
                zIndex: 100,
              }}
              className="animate-fade-in"
            >
              <div
                style={{
                  padding: '6px 12px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Switch Workspace View
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', gap: 8 }}
                onClick={() => {
                  setRoleSwitcherOpen(false);
                  navigate('/admin/dashboard');
                }}
              >
                <IconDashboard size={16} color="var(--color-primary-light)" />
                <span>Admin Panel</span>
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', gap: 8 }}
                onClick={() => {
                  setRoleSwitcherOpen(false);
                  navigate('/officer/dashboard');
                }}
              >
                <IconOfficer size={16} color="var(--color-accent)" />
                <span>Officer Portal</span>
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: '0.85rem', gap: 8 }}
                onClick={() => {
                  setRoleSwitcherOpen(false);
                  navigate('/citizen/dashboard');
                }}
              >
                <IconCar size={16} color="var(--color-success)" />
                <span>Citizen Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 4,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-out)',
                  whiteSpace: 'nowrap',
                })}
              >
                <IconComponent size={20} color="currentColor" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
          }}
        >
          {sidebarOpen && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: sidebarOpen ? 'flex-start' : 'center', gap: 8 }}
            onClick={handleLogout}
            title="Logout"
          >
            <IconLogOut size={16} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 260 : 72,
          transition: 'margin-left 0.3s var(--ease-out)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top Header Bar */}
        <header
          style={{
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
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <IconChevronLeft size={18} /> : <IconChevronRight size={18} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }} ref={popoverRef}>
            {/* Notifications Button */}
            <button
              onClick={() => navigate(`/${user?.role}/notifications`)}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: 38,
                height: 38,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              title="Notifications"
            >
              <IconBell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    background: 'var(--color-danger)',
                    color: 'white',
                    borderRadius: 10,
                    padding: '1px 5px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    minWidth: 16,
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Clickable User Avatar Trigger */}
            <button
              onClick={() => setPopoverOpen(!popoverOpen)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              title="Account & Settings"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: 'var(--shadow-sm)',
                    border: '2px solid var(--color-primary)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'white',
                    boxShadow: 'var(--shadow-sm)',
                    border: '2px solid var(--border-subtle)',
                  }}
                >
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </div>
              )}
            </button>

            {/* User Avatar Popover Menu */}
            {popoverOpen && (
              <div className="avatar-popover">
                {/* Popover User Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '2px solid var(--color-primary)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </div>
                  )}
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'var(--text-primary)',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.email}
                    </div>
                    <span className="badge badge-info" style={{ marginTop: 4, textTransform: 'capitalize' }}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Popover Controls */}
                <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Theme Switcher Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'var(--bg-surface-raised)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {theme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />}
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Profile Edit Option */}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: '0.875rem' }}
                    onClick={() => {
                      setPopoverOpen(false);
                      setProfileModalOpen(true);
                    }}
                  >
                    <IconRules size={16} />
                    <span>Edit Profile & Settings</span>
                  </button>

                  {/* Role Specific Shortcuts */}
                  {user?.role === 'citizen' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: '0.875rem' }}
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate('/citizen/safety-score');
                      }}
                    >
                      <IconShieldCheck size={16} />
                      <span>My Safety Score</span>
                    </button>
                  )}
                  {user?.role === 'officer' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: '0.875rem' }}
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate('/officer/stats');
                      }}
                    >
                      <IconAnalytics size={16} />
                      <span>Officer Performance</span>
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', gap: 10, fontSize: '0.875rem' }}
                      onClick={() => {
                        setPopoverOpen(false);
                        navigate('/admin/analytics');
                      }}
                    >
                      <IconAnalytics size={16} />
                      <span>Analytics Overview</span>
                    </button>
                  )}
                </div>

                {/* Popover Footer Logout */}
                <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                    onClick={handleLogout}
                  >
                    <IconLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Identity Verification Warning Banner for Citizen */}
        {user?.role === 'citizen' && !isProfileComplete && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(245, 158, 11, 0.12))',
              borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconShield size={18} color="var(--color-warning)" />
              <span>
                <strong>Account Verification Required:</strong> To prevent identity misuse and access full citizen actions (reporting, appeals, fine payments, & vehicle management), please complete your official profile.
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setProfileModalOpen(true)}
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Verify Profile Now
            </button>
          </div>
        )}

        {/* Page content */}
        <main style={{ padding: 24, flex: 1 }} className="animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* User Profile Settings Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
