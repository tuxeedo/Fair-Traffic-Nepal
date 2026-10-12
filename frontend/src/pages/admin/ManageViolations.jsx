import { isCancelled } from '../../utils/violationStatus';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { violationsAPI, evidenceAPI } from '../../services/api';

const views = { all: 'All Violations', active: 'Active Violations', recent: 'Violations in the Last 30 Days', warnings: 'Warnings Issued', fines: 'Fines Issued', unpaid: 'Unpaid Fines', paid: 'Paid Fines' };

export default function ManageViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [params, setParams] = useSearchParams();
  const view = Object.hasOwn(views, params.get('view')) ? params.get('view') : 'all';
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const search = params.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const changeView = nextView => setParams({ view: nextView });

  useEffect(() => {
    let active = true;
    setLoading(true); setError(false); setSearchInput(search); setSelectedViolation(null);
    violationsAPI.all({ view, page, ...(search ? { search } : {}) })
      .then(res => { if (active) { const records = res.data.results || (Array.isArray(res.data) ? res.data : []); setViolations(records); setCount(res.data.count ?? records.length); setHasNext(Boolean(res.data.next)); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [view, page, search, attempt]);

  const viewEvidence = async (v) => {
    setSelectedViolation(v);
    setLoadingEvidence(true);
    setEvidence([]);
    try {
      const res = await evidenceAPI.forViolation(v.id);
      setEvidence(res.data.results || res.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingEvidence(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{views[view]}</h1>
        <p className="page-subtitle">{view === 'unpaid' ? 'Drivers with outstanding fines. Accepted appeals are excluded.' : view === 'all' ? 'System-wide records, including cancelled cases retained for audit history' : 'Records matching the selected dashboard view. Cancelled cases are excluded.'}</p>
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 8 }}>View<select className="form-select" value={view} onChange={e => changeView(e.target.value)}>{Object.entries(views).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <form onSubmit={e => { e.preventDefault(); setParams({ view, ...(searchInput.trim() ? { search: searchInput.trim() } : {}) }); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          <input className="form-input" aria-label="Search drivers or locations" placeholder="Search driver name or location" value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
          <button className="btn btn-primary" type="submit">Search</button>
        </form>
      </div>

      {loading ? <div className="skeleton" style={{ height: 300 }} /> : error ? <div className="empty-state" role="alert"><h2>Records couldn’t be loaded</h2><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div> : violations.length === 0 ? <div className="empty-state"><h2>No matching records</h2><p className="page-subtitle">Try another view or search.</p></div> : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Driver</th>
                <th>Violation</th>
                <th>Action</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Officer</th>
                <th>Location</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600 }}>{v.driver_name}</td>
                  <td>{v.violation_type_name}</td>
                  <td>
                    <span className={`badge badge-${v.action_taken === 'warning' ? 'warning' : 'fine'}`}>
                      {v.action_taken}
                    </span>
                  </td>
                  <td>{isCancelled(v) ? 'Cancelled · No fine due' : v.fine_amount > 0 ? `NPR ${v.fine_amount}` : '-'}</td>
                  <td>
                    {isCancelled(v) ? <span className="badge badge-success">Cancelled · Appeal accepted</span> : v.action_taken === 'fine' ? (
                      <span className={`badge badge-${v.is_paid ? 'success' : 'danger'}`}>
                        {v.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{v.officer_name}</td>
                  <td style={{ fontSize: '0.8rem' }}>{v.location_description || '-'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewEvidence(v)}>
                      🖼️ View Proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && <div className="records-footer"><span>{count} matching records · Page {page}</span><div><button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setParams({ view, ...(search ? { search } : {}), page: String(page - 1) })}>Previous</button><button className="btn btn-ghost btn-sm" disabled={!hasNext} onClick={() => setParams({ view, ...(search ? { search } : {}), page: String(page + 1) })}>Next</button></div></div>}

      {selectedViolation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 600, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                Evidence for Violation #{selectedViolation.id}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedViolation(null)} style={{ fontSize: '1.2rem', padding: 0 }}>✕</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {loadingEvidence ? (
                <div style={{ textAlign: 'center', padding: 20 }}>Loading files...</div>
              ) : evidence.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>
                  No evidence uploaded for this violation.
                </div>
              ) : (
                evidence.map((e) => {
                  const isImg = e.file.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)/);
                  return (
                    <div key={e.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                      {isImg ? (
                        <img src={e.file} alt="Evidence photo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      ) : (
                        <video src={e.file} controls style={{ width: '100%', display: 'block' }} />
                      )}
                      <div style={{ padding: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Uploaded at: {new Date(e.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-primary" onClick={() => setSelectedViolation(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
