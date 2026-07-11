import { useState } from 'react';

export default function OfficerStats() {
  return (
    <div className="animate-fade-in">
      <div className="page-header"><h1 className="page-title">My Statistics</h1><p className="page-subtitle">Your performance overview</p></div>
      <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
        <div className="empty-state-icon">📊</div>
        <p style={{ color: 'var(--text-secondary)' }}>Performance statistics are available on the admin dashboard. Contact your administrator to view detailed reports.</p>
      </div>
    </div>
  );
}
