import { isCancelled, isUnpaidFine } from '../../utils/violationStatus';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { violationsAPI } from '../../services/api';
import { IconViolation, IconCreditCard, IconShieldCheck, IconSearch, IconWarning } from '../../components/Icons';

const isUnpaid = isUnpaidFine;
const money = value => `NPR ${Number(value || 0).toLocaleString()}`;

export default function ViolationHistory() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    violationsAPI.my({ page }).then(res => { if (active) { setViolations(res.data.results || (Array.isArray(res.data) ? res.data : [])); setHasNext(Boolean(res.data.next)); } })
      .catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, attempt]);
  const unpaid = violations.filter(isUnpaid);
  const visible = violations.filter(v => {
    const matches = `${v.violation_type_name || ''} ${v.vehicle_registration || ''} ${v.location_description || ''}`.toLowerCase().includes(query.toLowerCase().trim());
    return matches && (filter === 'all' || (filter === 'active' && !isCancelled(v)) || (filter === 'cancelled' && isCancelled(v)) || (filter === 'unpaid' && isUnpaid(v)) || (filter === 'warnings' && !isCancelled(v) && v.action_taken === 'warning') || (filter === 'resolved' && (v.is_paid || isCancelled(v))));
  });
  return (
    <div className="violations-page animate-fade-in">
      <div className="page-header"><span className="section-eyebrow">Your driving record</span><h1 className="page-title">Violation History</h1><p className="page-subtitle">Review traffic records, check payment status, and manage appeals.</p></div>
      {loading ? <div className="skeleton" role="status" aria-label="Loading violations" style={{ height: 320 }} /> : error ? <div className="empty-state" role="alert"><h2>Couldn’t load violations</h2><p className="page-subtitle">Please try again to view your records.</p><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div> : <>
        <div className="violation-summary">
          <div><span className="summary-icon"><IconViolation size={22} /></span><div><span>Active on this page</span><strong>{violations.filter(v => !isCancelled(v)).length}</strong></div></div>
          <div><span className="summary-icon summary-warning"><IconCreditCard size={22} /></span><div><span>Unpaid on this page</span><strong>{money(unpaid.reduce((total, v) => total + Number(v.fine_amount || 0), 0))}</strong></div></div>
          <div><span className="summary-icon summary-success"><IconShieldCheck size={22} /></span><div><span>Resolved on this page</span><strong>{violations.filter(v => v.is_paid || isCancelled(v)).length}</strong></div></div>
        </div>
        <section className="glass-card violation-records" aria-label="Violation records">
          <div className="violation-toolbar"><div className="violation-filters" role="group" aria-label="Filter records on this page">
            {[['active', 'Active'], ['cancelled', 'Cancelled'], ['all', 'All records'], ['unpaid', 'Unpaid'], ['warnings', 'Warnings'], ['resolved', 'Resolved']].map(([key, label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}{key === 'unpaid' && <span>{unpaid.length}</span>}</button>)}
          </div><label className="record-search"><IconSearch size={17} /><input aria-label="Search records on this page" placeholder="Search violation or vehicle…" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
          {visible.length === 0 ? <div className="empty-state"><IconShieldCheck size={36} /><h2>{violations.length ? 'No matching records' : 'No violations on this page'}</h2><p className="empty-state-text">{violations.length ? 'Try another filter or search term.' : 'Keep making safe choices on the road.'}</p></div> : <div className="violation-list">
            {visible.map(v => <article className="violation-record" key={v.id}>
              <div className={`violation-record-icon ${v.action_taken === 'warning' ? 'record-warning' : ''}`}>{v.action_taken === 'warning' ? <IconWarning size={22} /> : <IconViolation size={22} />}</div>
              <div className="violation-record-body"><div className="violation-record-title"><h2>{v.violation_type_name}</h2><span className={`badge badge-${v.violation_category === 'dangerous' ? 'danger' : v.violation_category === 'major' ? 'warning' : 'info'}`}>{v.violation_category}</span></div>
                <p className="violation-meta">{new Date(v.created_at).toLocaleDateString()}{v.vehicle_registration && <> · {v.vehicle_registration}</>}{v.location_description && <> · {v.location_description}</>}</p>
                <div className="violation-status-line"><span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>{v.action_taken}</span>{isCancelled(v) ? <span className="badge badge-success">Cancelled · Appeal accepted</span> : v.action_taken === 'fine' ? <span className={`badge badge-${v.is_paid ? 'success' : 'danger'}`}>{v.is_paid ? 'Paid' : 'Unpaid'}</span> : <span className="record-note">No payment required</span>}{v.appeal_status && !isCancelled(v) && <span className="record-note">Appeal: {v.appeal_status}</span>}</div>
              </div>
              <div className="violation-record-payment"><strong>{isCancelled(v) ? 'Fine cancelled' : v.action_taken === 'fine' ? money(v.fine_amount) : 'Warning'}</strong><div className="violation-record-actions">
                {isUnpaid(v) && <button className="btn btn-primary btn-sm" onClick={() => navigate(`/citizen/pay/${v.id}`)}>Pay fine</button>}
                {v.action_taken === 'fine' && !isCancelled(v) && <button className="btn btn-ghost btn-sm" onClick={() => navigate('/citizen/appeals', { state: { violationId: v.id } })}>{v.appeal_status ? 'View appeal' : 'Appeal'}</button>}
                {isCancelled(v) && <span className="record-note">No fine due · Kept for audit history</span>}
              </div></div>
            </article>)}
          </div>}
          <div className="records-footer"><span>{visible.length} of {violations.length} loaded records · Page {page}</span><div><button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="btn btn-ghost btn-sm" disabled={!hasNext} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </section>
      </>}
    </div>
  );
}
