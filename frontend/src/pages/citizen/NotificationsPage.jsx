import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getNotificationDestination } from '../../utils/notificationUtils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await notificationsAPI.my();
      setNotifications(res.data.results || []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      showToast('All notifications marked as read');
      fetchNotifs();
    } catch {
      /* ignore */
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      try {
        await notificationsAPI.markRead(n.id);
      } catch {
        /* ignore */
      }
    }
    const destination = getNotificationDestination(n, user?.role);
    if (destination) {
      navigate(destination);
    }
  };

  const typeColors = {
    violation: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    fine: 'var(--color-danger)',
    appeal: 'var(--color-primary)',
    report: 'var(--color-accent)',
    system: 'var(--text-muted)',
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Your activity updates & direct portal shortcuts</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button className="btn btn-ghost" onClick={markAllRead}>
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <div className="empty-state-text">No notifications found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => {
            const dest = getNotificationDestination(n, user?.role);
            return (
              <div
                key={n.id}
                className="glass-card"
                style={{
                  padding: '16px 22px',
                  opacity: n.is_read ? 0.75 : 1,
                  borderLeft: `4px solid ${typeColors[n.notification_type] || 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  background: n.is_read ? 'var(--bg-surface)' : 'rgba(99,102,241,0.06)',
                }}
                onClick={() => handleNotificationClick(n)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!n.is_read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--color-primary)',
                          display: 'inline-block',
                        }}
                      />
                    )}
                    <span style={{ fontWeight: n.is_read ? 600 : 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {n.title}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.08)',
                        color: typeColors[n.notification_type] || 'var(--text-muted)',
                      }}
                    >
                      {n.notification_type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                    {n.message}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Open Portal ➔
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
