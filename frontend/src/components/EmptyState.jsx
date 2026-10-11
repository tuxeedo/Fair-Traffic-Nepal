import { IconCar, IconService, IconWarning, IconReport, IconAppeal, IconShield, IconBell, IconAnalytics } from './Icons';

const icons = { vehicle: IconCar, service: IconService, warning: IconWarning, report: IconReport, appeal: IconAppeal, shield: IconShield, bell: IconBell, analytics: IconAnalytics };

export default function EmptyState({ kind = 'report', label, title, description, action, error = false }) {
  const Icon = icons[kind] || IconReport;
  return (
    <section className={`workspace-empty workspace-empty-${kind}${error ? ' workspace-empty-error' : ''}`} role={error ? 'alert' : undefined}>
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-orbit" /><span className="empty-orbit-dot" /><span className="empty-orbit-spark">+</span>
        <div className="empty-icon-tile"><Icon size={40} /></div>
        <div className="empty-mini-card"><span /><span /><span /></div>
      </div>
      <div className="empty-copy"><span className="empty-label">{label}</span><h2>{title}</h2><p>{description}</p>{action && <div className="empty-action">{action}</div>}</div>
    </section>
  );
}
