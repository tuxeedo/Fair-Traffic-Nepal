/**
 * Resolves target navigation route for a notification item based on user role and notification payload.
 */
export const getNotificationDestination = (n, role) => {
  if (!n) return `/${role || 'citizen'}/dashboard`;

  const type = (n.notification_type || '').toLowerCase();
  const title = (n.title || '').toLowerCase();
  const msg = (n.message || '').toLowerCase();
  const id = n.related_object_id;

  if (role === 'citizen') {
    // Fine notification: go straight to pay fine page if id present, or violations page
    if (type === 'fine' || title.includes('fine') || msg.includes('fined') || msg.includes('pay')) {
      return id ? `/citizen/pay/${id}` : '/citizen/violations';
    }
    if (type === 'violation' || title.includes('violation')) {
      return '/citizen/violations';
    }
    if (type === 'warning' || title.includes('warning')) {
      return '/citizen/warnings';
    }
    if (type === 'appeal' || title.includes('appeal')) {
      return '/citizen/appeals';
    }
    if (title.includes('complaint') || msg.includes('complaint')) {
      return '/citizen/complaints';
    }
    if (type === 'report' || title.includes('report')) {
      return '/citizen/reports';
    }
    if (title.includes('vehicle') || msg.includes('vehicle')) {
      return '/citizen/vehicles';
    }
    return '/citizen/notifications';
  }

  if (role === 'admin') {
    if (title.includes('complaint') || msg.includes('complaint')) {
      return '/admin/complaints';
    }
    if (type === 'appeal' || title.includes('appeal') || msg.includes('appeal')) {
      return '/admin/appeals';
    }
    if (type === 'report' || title.includes('report') || msg.includes('report')) {
      return '/admin/reports';
    }
    if (type === 'fine' || type === 'violation' || title.includes('violation')) {
      return '/admin/violations';
    }
    if (title.includes('verification') || msg.includes('verification')) {
      return '/admin/verifications';
    }
    if (title.includes('correction') || title.includes('profile') || msg.includes('correction')) {
      return '/admin/corrections';
    }
    if (title.includes('user') || title.includes('officer')) {
      return title.includes('officer') ? '/admin/officers' : '/admin/users';
    }
    return '/admin/notifications';
  }

  if (role === 'officer') {
    if (type === 'report' || title.includes('report')) {
      return '/officer/reports';
    }
    if (type === 'violation' || type === 'fine' || title.includes('violation')) {
      return '/officer/dashboard';
    }
    return '/officer/notifications';
  }

  return `/${role || 'citizen'}/dashboard`;
};
