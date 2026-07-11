import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { usersAPI.list().then(res => setUsers(res.data.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">Manage Users</h1><p className="page-subtitle">All registered users</p></div>
      {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.first_name} {u.last_name}</td>
                <td>{u.username}</td><td>{u.email}</td>
                <td><span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'officer' ? 'warning' : 'info'}`}>{u.role}</span></td>
                <td>{u.phone || '-'}</td>
                <td><span className={`badge badge-${u.is_active ? 'success' : 'rejected'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
