import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI, correctionsAPI } from '../services/api';
import {
  formatNepaliPhone,
  formatCitizenshipNumber,
  formatNIDNumber,
  formatDriverLicense,
} from '../utils/formatters';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, refreshProfile, isProfileComplete } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security' | 'corrections'
  const [loading, setLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '+977 ',
    license_number: '',
    citizenship_number: '',
    nid_number: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Correction Request State
  const [correctionsList, setCorrectionsList] = useState([]);
  const [correctionsLoading, setCorrectionsLoading] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    field_name: 'license_number',
    requested_value: '',
    reason: '',
  });
  const [correctionFile, setCorrectionFile] = useState(null);

  const fieldOptions = [
    { value: 'first_name', label: 'First Name' },
    { value: 'last_name', label: 'Last Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number (+977)' },
    { value: 'citizenship_number', label: 'Citizenship Number' },
    { value: 'nid_number', label: 'National ID (NID)' },
    { value: 'license_number', label: 'Driver License Number' },
    { value: 'address', label: 'Address' },
    { value: 'date_of_birth', label: 'Date of Birth' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: formatNepaliPhone(user.phone || user.phone_number || ''),
        license_number: formatDriverLicense(user.license_number || ''),
        citizenship_number: formatCitizenshipNumber(user.citizenship_number || ''),
        nid_number: formatNIDNumber(user.nid_number || ''),
        address: user.address || '',
      });
      setAvatarPreview(user.avatar || null);
      setAvatarFile(null);
    }
  }, [user, isOpen]);


  useEffect(() => {
    if (isOpen && activeTab === 'corrections') {
      fetchMyCorrections();
    }
  }, [isOpen, activeTab]);

  const fetchMyCorrections = async () => {
    setCorrectionsLoading(true);
    try {
      const res = await correctionsAPI.myCorrections();
      setCorrectionsList(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load corrections:', err);
    } finally {
      setCorrectionsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      await authAPI.updateProfile(payload);
      await refreshProfile();
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      showToast('Password changed successfully!', 'success');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to change password';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!correctionForm.requested_value.trim()) {
      showToast('Please enter the requested new value', 'error');
      return;
    }
    if (!correctionForm.reason.trim()) {
      showToast('Please provide a reason for the correction request', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('field_name', correctionForm.field_name);
      payload.append('requested_value', correctionForm.requested_value.trim());
      payload.append('reason', correctionForm.reason.trim());
      if (correctionFile) {
        payload.append('supporting_document', correctionFile);
      }

      await correctionsAPI.requestCorrection(payload);
      showToast('Correction request submitted! Waiting for Admin review.', 'success');
      setShowCorrectionForm(false);
      setCorrectionForm({ field_name: 'license_number', requested_value: '', reason: '' });
      setCorrectionFile(null);
      fetchMyCorrections();
    } catch (err) {
      const fieldErr = err.response?.data?.field_name?.[0] || err.response?.data?.requested_value?.[0] || err.response?.data?.detail || 'Failed to submit correction request';
      showToast(fieldErr, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>✅ Approved</span>;
      case 'Rejected':
        return <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>❌ Rejected</span>;
      default:
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>⏳ Pending Review</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: 'white'
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {user?.first_name} {user?.last_name}
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role} Account • {user?.email}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px 8px', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        {/* Identity Verification Warning Banner */}
        {user?.role === 'citizen' && !isProfileComplete && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <div>
              <strong>Account Verification Required:</strong> Please fill in your Phone, License No., Citizenship No., & Address below to enable full feature access.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 20, gap: 16 }}>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            style={{
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'details' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'details' ? 'var(--color-primary-light)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            👤 Personal Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'security' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'security' ? 'var(--color-primary-light)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            🔒 Security & Password
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('corrections')}
            style={{
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'corrections' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'corrections' ? 'var(--color-primary-light)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🛡️ Request Correction
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '12px 16px', background: 'var(--bg-surface-raised)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                  />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: 800, color: 'white',
                  }}>
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Profile Photo</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Upload a official headshot photo (PNG/JPG)</div>
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  📷 Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Email Address (Verified Identity)</label>
                <button
                  type="button"
                  onClick={() => {
                    setCorrectionForm({ field_name: 'email', requested_value: '', reason: '' });
                    setShowCorrectionForm(true);
                    setActiveTab('corrections');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-light)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  🛡️ Request Email Correction
                </button>
              </div>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                🔒 Email is your primary account credential. To update your email, click <strong>Request Email Correction</strong> for Admin review.
              </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Phone Number (+977) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+977 98XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatNepaliPhone(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver License Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 01-06-00123456"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: formatDriverLicense(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Citizenship Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 27-01-75-01234"
                  value={formData.citizenship_number}
                  onChange={(e) => setFormData({ ...formData, citizenship_number: formatCitizenshipNumber(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">National ID (NID)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 123-456-7890"
                  value={formData.nid_number}
                  onChange={(e) => setFormData({ ...formData, nid_number: formatNIDNumber(e.target.value) })}
                />
              </div>
            </div>


            <div className="form-group">
              <label className="form-label">Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Kathmandu, Nepal"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setActiveTab('corrections')}
                style={{ fontSize: '0.8rem', color: 'var(--color-accent-light)' }}
              >
                🛡️ Need official correction for verified identity fields?
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Request Profile Correction */}
        {activeTab === 'corrections' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '12px 16px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Identity Profile Corrections</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Submit official correction requests to update sensitive identity fields. Admin review is required.
                </div>
              </div>
              {!showCorrectionForm && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCorrectionForm(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                >
                  ➕ Request Correction
                </button>
              )}
            </div>

            {/* Submission Form */}
            {showCorrectionForm && (
              <form onSubmit={handleCorrectionSubmit} style={{ padding: 16, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-primary-light)' }}>
                    📝 New Profile Correction Request
                  </h4>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCorrectionForm(false)} style={{ padding: '2px 6px' }}>
                    ✕ Close Form
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Select Field to Correct *</label>
                    <select
                      className="form-input"
                      value={correctionForm.field_name}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, field_name: e.target.value, requested_value: '' })}
                      required
                    >
                      {fieldOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} (Current: {user?.[opt.value] || 'Not set'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Corrected Value *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter new correct value..."
                      value={correctionForm.requested_value}
                      onChange={(e) => setCorrectionForm({ ...correctionForm, requested_value: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Correction *</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Provide a clear explanation for why this information needs to be corrected..."
                    value={correctionForm.reason}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supporting Proof Document (Optional)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setCorrectionFile(e.target.files[0] || null)}
                    style={{ padding: '6px 12px' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Upload Citizenship card, Driver license scan, or official government proof (Max 10 MB).
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCorrectionForm(false)} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? 'Submitting Request...' : 'Submit Request for Admin Review'}
                  </button>
                </div>
              </form>
            )}

            {/* My Corrections History List */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                📋 My Correction Requests & History
              </h4>

              {correctionsLoading ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading correction requests...
                </div>
              ) : correctionsList.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: 'var(--bg-surface-raised)', borderRadius: 8, border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No profile correction requests submitted yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                  {correctionsList.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: 'var(--bg-surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.83rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          Field: {item.field_name_display}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <div>Current: <span style={{ color: 'var(--text-secondary)' }}>{item.current_value || '(Blank)'}</span></div>
                        <div>Requested: <strong style={{ color: 'var(--color-primary-light)' }}>{item.requested_value}</strong></div>
                      </div>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 4 }}>
                        <strong>Reason:</strong> {item.reason}
                      </div>

                      {item.rejection_reason && item.status === 'Rejected' && (
                        <div style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 6, color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>
                          <strong>Rejection Reason:</strong> {item.rejection_reason}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Submitted: {new Date(item.created_at).toLocaleDateString()}</span>
                        {item.supporting_document && (
                          <a href={item.supporting_document} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                            📄 View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
