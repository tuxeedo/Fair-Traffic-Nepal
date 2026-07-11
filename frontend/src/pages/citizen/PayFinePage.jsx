import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { violationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PayFinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [violation, setViolation] = useState(null);
  const [method, setMethod] = useState('esewa');
  const [loading, setLoading] = useState(false);

  useEffect(() => { violationsAPI.detail(id).then(res => setViolation(res.data)).catch(() => navigate('/citizen/violations')); }, [id]);

  const handlePay = async () => {
    setLoading(true);
    try { await violationsAPI.pay(id, { payment_method: method }); showToast('Payment successful!'); navigate('/citizen/violations'); }
    catch { showToast('Payment failed', 'error'); }
    setLoading(false);
  };

  if (!violation) return <div className="skeleton" style={{ height: 200 }} />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="page-header"><h1 className="page-title">Pay Fine</h1><p className="page-subtitle">Complete your fine payment</p></div>
      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Due</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-danger)' }}>NPR {violation.fine_amount}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>{violation.violation_type_name}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['esewa', 'khalti', 'bank_transfer', 'cash'].map(m => (
              <button key={m} type="button" className={`btn ${method === m ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMethod(m)} style={{ justifyContent: 'center' }}>
                {m === 'esewa' ? '💚 eSewa' : m === 'khalti' ? '💜 Khalti' : m === 'bank_transfer' ? '🏦 Bank' : '💵 Cash'}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-success btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={handlePay} disabled={loading}>
          {loading ? 'Processing...' : `Pay NPR ${violation.fine_amount}`}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>This is a simulated payment for demonstration purposes.</p>
      </div>
    </div>
  );
}
