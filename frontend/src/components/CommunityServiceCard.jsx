import { useState, useEffect } from 'react';
import { IconService } from './Icons';

export default function CommunityServiceCard({ service, onUpdate }) {
  const assigned = Math.max(0, Number(service.assigned_hours) || 0);
  const completed = Math.max(0, Number(service.completed_hours) || 0);
  const remaining = Math.max(0, assigned - completed);
  const percentage = assigned > 0 ? Math.min(100, Math.round(completed / assigned * 100)) : 0;
  const [hours, setHours] = useState(completed);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setHours(completed); }, [completed]);
  const status = service.status === 'completed' ? 'Completed' : service.status === 'in_progress' ? 'In progress' : 'Pending';
  const badge = service.status === 'completed' ? 'success' : service.status === 'in_progress' ? 'pending' : 'warning';
  const submit = async event => {
    event.preventDefault();
    if (saving || !Number.isFinite(Number(hours)) || Number(hours) < completed || Number(hours) > assigned) return;
    setSaving(true);
    try { await onUpdate(service.id, Number(hours)); } finally { setSaving(false); }
  };
  return (
    <article className="glass-card service-record-card">
      <div className="service-card-heading"><span className="record-symbol"><IconService size={24} /></span><span className={`badge badge-${badge}`}>{status}</span></div>
      <span className="section-eyebrow">Community service</span><h2>{service.service_type || 'General community service'}</h2>
      {onUpdate && <p className="service-driver">Assigned to <strong>{service.driver_name || 'Driver'}</strong></p>}
      {service.violation_details && <p className="service-context">{service.violation_details}{service.violation_date && <> · {new Date(service.violation_date).toLocaleDateString()}</>}</p>}
      <div className="service-hours"><div><strong>{completed}<small> / {assigned}</small></strong><span>hours completed</span></div><span className="service-percentage">{percentage}%</span></div>
      <progress className="service-progress" value={Math.min(completed, assigned)} max={assigned || 1} aria-label={`Community service hours: ${completed} of ${assigned} completed`} />
      <div className="service-progress-footer"><span>{remaining} hours remaining</span><span>{status === 'Completed' ? 'Task completed' : 'Track your progress'}</span></div>
      {onUpdate && service.status !== 'completed' && <form className="service-update-form" onSubmit={submit}><label htmlFor={`hours-${service.id}`}>Completed hours</label><div><input id={`hours-${service.id}`} type="number" className="form-input" min={completed} max={assigned} step="1" required value={hours} onChange={event => setHours(event.target.value)} /><button className="btn btn-primary btn-sm" disabled={saving} type="submit">{saving ? 'Saving…' : 'Update hours'}</button></div></form>}
    </article>
  );
}
