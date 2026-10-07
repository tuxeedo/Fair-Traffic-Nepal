import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import {
  formatNepaliPhone,
  formatCitizenshipNumber,
  formatNIDNumber,
} from '../utils/formatters';

const PRE_POPULATED_SAMPLE_CITIZENS = [
  { legal_name: 'Abhi Karki', citizenship: '27-01-75-00001', nid: '100-000-000001', license: '70-00-00000001', phone: '+977 9841000001', age: 25, dob: '2001-03-12' },
  { legal_name: 'Abheshek Chaudhary', citizenship: '27-01-75-00002', nid: '100-000-000002', license: '70-00-00000002', phone: '+977 9841000002', age: 24, dob: '2002-07-24' },
  { legal_name: 'Ragib Khyaju', citizenship: '27-01-75-00003', nid: '100-000-000003', license: '70-00-00000003', phone: '+977 9741000003', age: 23, dob: '2003-11-08' },
  { legal_name: 'Pranish Machamasi', citizenship: '27-01-75-00004', nid: '100-000-000004', license: '70-00-00000004', phone: '+977 9841000004', age: 25, dob: '2001-01-19' },
  { legal_name: 'Alisha Chaudhary', citizenship: '27-01-75-00005', nid: '100-000-000005', license: '70-00-00000005', phone: '+977 9741000005', age: 24, dob: '2002-09-30' },
  { legal_name: 'Sneha Shah', citizenship: '27-01-75-00006', nid: '100-000-000006', license: '70-00-00000006', phone: '+977 9841000006', age: 23, dob: '2003-12-05' },
  { legal_name: 'Sabin Shrestha', citizenship: '27-01-75-00007', nid: '100-000-000007', license: '70-00-00000007', phone: '+977 9741000007', age: 25, dob: '2001-04-14' },
  { legal_name: 'Pawan Regmi', citizenship: '27-01-75-00008', nid: '100-000-000008', license: '70-00-00000008', phone: '+977 9841000008', age: 24, dob: '2002-08-22' },
  { legal_name: 'Sabin Tamang', citizenship: '27-01-75-00009', nid: '100-000-000009', license: '70-00-00000009', phone: '+977 9741000009', age: 23, dob: '2003-02-17' },
  { legal_name: 'Nishcal Shakya', citizenship: '27-01-75-00010', nid: '100-000-000010', license: '70-00-00000010', phone: '+977 9841000010', age: 25, dob: '2001-10-11' },
  { legal_name: 'Jay Joshi', citizenship: '27-01-75-00011', nid: '100-000-000011', license: '70-00-00000011', phone: '+977 9841000011', age: 36, dob: '1990-06-25' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1); // Step 1: Identity Lookup, Step 2: Account Creation
  const [identityType, setIdentityType] = useState('citizenship'); // 'citizenship' | 'nid'
  const [identityNumber, setIdentityNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '+977 ',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Step 1: Verify Government Identity with dual factors (Number + Date of Birth)
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    if (!identityNumber.trim() || !dateOfBirth.trim()) {
      showToast('The information could not be verified.', 'error');
      return;
    }

    setVerifying(true);
    try {
      const res = await authAPI.verifyIdentity({
        identity_type: identityType,
        identity_number: identityNumber,
        date_of_birth: dateOfBirth,
      });

      setVerifiedRecord(res.data);
      if (res.data.phone) {
        setForm((prev) => ({ ...prev, phone: res.data.phone }));
      }
      setStep(2);
      showToast(`Identity Verified: ${res.data.full_name}`, 'success');
    } catch (err) {
      // Security Policy: Never leak oracle info (do not state if number exists or DOB is wrong)
      showToast('The information could not be verified.', 'error');
    } finally {
      setVerifying(false);
    }
  };


  const handleSelectSample = (citizen) => {
    if (identityType === 'citizenship') {
      setIdentityNumber(citizen.citizenship);
    } else {
      setIdentityNumber(citizen.nid);
    }
    setDateOfBirth(citizen.dob);
    setShowSampleModal(false);
  };


  // Step 2: Create Account
  const handleSubmitAccount = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      showToast('Please enter a username', 'error');
      return;
    }
    if (form.password !== form.password_confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        first_name: verifiedRecord.first_name,
        last_name: verifiedRecord.last_name,
        citizenship_number: verifiedRecord.citizenship_number,
        nid_number: verifiedRecord.nid_number,
        license_number: verifiedRecord.license_number,
        date_of_birth: verifiedRecord.date_of_birth,
        address: verifiedRecord.address,
      };

      await register(payload);
      showToast('Account successfully created and linked to Government Registry! Please login.', 'success');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors
        ? Object.values(errors).flat().join(' ')
        : 'Registration failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: 20,
      }}
    >
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 20, border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
              🇳🇵 Nepal Government Identity Verification Protocol
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            Citizen Account Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {step === 1 ? 'Step 1 of 2: Verify Government Identity Record' : 'Step 2 of 2: Set Up Login & Account Credentials'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: 32 }}>
          {/* STEP 1: IDENTITY VERIFICATION LOOKUP */}
          {step === 1 && (
            <form onSubmit={handleVerifyIdentity}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>Select Identification Document Type *</label>
                  <button
                    type="button"
                    onClick={() => setShowSampleModal(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary-light)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    📋 View Pre-Populated Citizen Table
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentityType('citizenship');
                      setIdentityNumber('');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: identityType === 'citizenship' ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      background: identityType === 'citizenship' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-raised)',
                      color: identityType === 'citizenship' ? 'var(--color-primary-light)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    🇳🇵 Citizenship Number
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIdentityType('nid');
                      setIdentityNumber('');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: identityType === 'nid' ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                      background: identityType === 'nid' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-raised)',
                      color: identityType === 'nid' ? 'var(--color-primary-light)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    🪪 National ID (NID)
                  </button>
                </div>
              </div>

              {/* Document Number Input */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="identity_number">
                  {identityType === 'citizenship' ? 'Citizenship Number (e.g. 27-01-75-00001)' : 'National ID Number (e.g. 100-000-000001)'} *
                </label>
                <input
                  id="identity_number"
                  className="form-input"
                  type="text"
                  placeholder={identityType === 'citizenship' ? '27-01-75-00001' : '100-000-000001'}
                  value={identityNumber}
                  onChange={(e) => {
                    const formatted = identityType === 'citizenship'
                      ? formatCitizenshipNumber(e.target.value)
                      : formatNIDNumber(e.target.value);
                    setIdentityNumber(formatted);
                  }}
                  required
                  autoFocus
                />
              </div>

              {/* Date of Birth Input */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="date_of_birth">
                  Date of Birth *
                </label>
                <input
                  id="date_of_birth"
                  className="form-input"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  🔒 Security Rule: Both Document Number and Date of Birth must match to verify identity.
                </div>
              </div>


              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={verifying}
              >
                {verifying ? '🔍 Searching Government Registry...' : '🔍 Verify Identity Record'}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFIED CARD & ACCOUNT SETUP */}
          {step === 2 && verifiedRecord && (
            <form onSubmit={handleSubmitAccount}>
              {/* Verified Identity Card */}
              <div style={{
                padding: 16,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 12,
                marginBottom: 24
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🛡️ Verified Government Record
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Change Identity
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Legal Full Name (Read-only)</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: 2 }}>
                      {verifiedRecord.full_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date of Birth (Read-only)</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginTop: 2 }}>
                      {verifiedRecord.date_of_birth}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Citizenship No.</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                      {verifiedRecord.citizenship_number}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>National ID (NID)</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                      {verifiedRecord.nid_number}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="username">Choose Username *</label>
                  <input
                    id="username"
                    className="form-input"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="phone">Phone Number (+977) *</label>
                  <input
                    id="phone"
                    className="form-input"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: formatNepaliPhone(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password *</label>
                  <input
                    id="password"
                    className="form-input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password_confirm">Confirm Password *</label>
                  <input
                    id="password_confirm"
                    className="form-input"
                    type="password"
                    name="password_confirm"
                    value={form.password_confirm}
                    onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                disabled={loading}
              >
                {loading ? 'Linking & Registering Account...' : '🚀 Create & Link Account'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* Pre-populated Citizens Sample Table Modal */}
      {showSampleModal && (
        <div className="modal-overlay" onClick={() => setShowSampleModal(false)}>
          <div className="modal-content" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>🇳🇵 Pre-Populated Nepal Citizen Registry Table</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click any citizen record to select their Citizenship or NID number for verification testing.
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSampleModal(false)}>✕</button>
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Legal Name</th>
                    <th>Age (DOB)</th>
                    <th>Citizenship Number</th>
                    <th>National ID (NID)</th>
                    <th>Phone Number</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {PRE_POPULATED_SAMPLE_CITIZENS.map((c) => (
                    <tr key={c.citizenship}>
                      <td style={{ fontWeight: 600 }}>{c.legal_name}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontWeight: 700 }}>Age {c.age}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.dob}</div>
                      </td>
                      <td><code>{c.citizenship}</code></td>
                      <td><code>{c.nid}</code></td>
                      <td><code>{c.phone}</code></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleSelectSample(c)}
                          style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>


              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setShowSampleModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
