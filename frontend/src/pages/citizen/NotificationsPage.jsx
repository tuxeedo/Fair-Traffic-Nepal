import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetch = async () => { try { const res = await notificationsAPI.my(); setNotifications(res.data.results || []); } catch {} setLoading(false); };
  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => { await notificationsAPI.markRead(id); fetch(); };
  const markAllRead = async () => { await notificationsAPI.markAllRead(); showToast('All marked as read'); fetch(); };

  const typeColors = { violation: 'var(--color-danger)', warning: 'var(--color-warning)', fine: 'var(--color-danger)', appeal: 'var(--color-primary)', report: 'var(--color-accent)', system: 'var(--text-muted)' };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 className="page-title">Notifications</h1><p className="page-subtitle">Your activity updates</p></div>
        <button className="btn btn-ghost" onClick={markAllRead}>Mark All Read</button>
      </div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : notifications.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🔔</div><div className="empty-state-text">No notifications</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} className="glass-card" style={{ padding: '14px 20px', opacity: n.is_read ? 0.6 : 1, borderLeft: `3px solid ${typeColors[n.notification_type] || 'var(--border-color)'}`, cursor: 'pointer' }} onClick={() => !n.is_read && markRead(n.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: '0.9rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
