import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';
import { formatCitizenshipNumber, formatNIDNumber, formatNepaliPhone } from '../utils/formatters';
import './LoginPage.css';

export default function LoginPage() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration State
  const [step, setStep] = useState(1);
  const [identityType, setIdentityType] = useState('citizenship');
  const [identityNumber, setIdentityNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState(null);
  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    phone: '+977 ',
    password: '',
    password_confirm: '',
  });
  const [regLoading, setRegLoading] = useState(false);

  const { login, register, user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Helper for role redirection
  const navigateByRole = (userRole) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'officer':
        navigate('/officer/dashboard', { replace: true });
        break;
      case 'citizen':
      default:
        navigate('/citizen/dashboard', { replace: true });
        break;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigateByRole(user.role);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(username, password);
      const name = userData?.user?.first_name || userData?.user?.username || username;
      showToast(`Jay Nepal, ${name}! Redirecting...`, 'success');

      setTimeout(() => {
        const role = userData?.user?.role || userData?.role || user?.role || 'citizen';
        navigateByRole(role);
      }, 1000);
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(errorMsg, 'error');
    }
  };

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
        setRegForm((prev) => ({ ...prev, phone: res.data.phone }));
      }
      setStep(2);
      showToast(`Identity Verified: ${res.data.full_name}`, 'success');
    } catch (err) {
      showToast('The information could not be verified.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitAccount = async (e) => {
    e.preventDefault();

    if (!regForm.username.trim()) {
      showToast('Please enter a username', 'error');
      return;
    }
    if (regForm.password !== regForm.password_confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const payload = {
        ...regForm,
        first_name: verifiedRecord.first_name,
        last_name: verifiedRecord.last_name,
        citizenship_number: verifiedRecord.citizenship_number,
        nid_number: verifiedRecord.nid_number,
        license_number: verifiedRecord.license_number,
        date_of_birth: verifiedRecord.date_of_birth,
        address: verifiedRecord.address,
      };

      await register(payload);
      showToast('Account successfully created! Please login.', 'success');

      // Reset form and switch back to login panel
      setStep(1);
      setVerifiedRecord(null);
      setIdentityNumber('');
      setDateOfBirth('');
      setIsRightPanelActive(false);
    } catch (err) {
      const errors = err.response?.data;
      const msg = errors
        ? Object.values(errors).flat().join(' ')
        : 'Registration failed';
      showToast(msg, 'error');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isRightPanelActive ? 'active' : ''}`} id="container">
        <div className="form-container sign-up" style={{ overflowY: 'auto' }}>
          {step === 1 ? (
            <form onSubmit={handleVerifyIdentity}>
              <h1>Verify Identity</h1>
              <span style={{ marginBottom: '15px' }}>Enter government ID to continue</span>

              <div style={{ display: 'flex', gap: '15px', margin: '10px 0', width: '100%', justifyContent: 'center' }}>
                <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    name="idType"
                    checked={identityType === 'citizenship'}
                    onChange={() => {
                      setIdentityType('citizenship');
                      setIdentityNumber('');
                    }}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  Citizenship
                </label>
                <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="radio"
                    name="idType"
                    checked={identityType === 'nid'}
                    onChange={() => {
                      setIdentityType('nid');
                      setIdentityNumber('');
                    }}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  National ID
                </label>
              </div>

              <input
                type="text"
                placeholder={identityType === 'citizenship' ? "Citizenship No (27-01...)" : "NID No (100-...)"}
                value={identityNumber}
                onChange={(e) => {
                  const formatted = identityType === 'citizenship'
                    ? formatCitizenshipNumber(e.target.value)
                    : formatNIDNumber(e.target.value);
                  setIdentityNumber(formatted);
                }}
                required
              />

              <div style={{ width: '100%', textAlign: 'left', marginTop: '5px' }}>
                <label style={{ fontSize: '12px', color: '#555', marginLeft: '5px' }}>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitAccount} style={{ padding: '20px 40px' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Create Account</h1>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginBottom: '10px' }}>
                ✓ Verified: {verifiedRecord?.full_name}
              </span>

              <input
                type="text"
                placeholder="Choose Username"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                required
                style={{ padding: '8px 15px', margin: '4px 0' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                required
                style={{ padding: '8px 15px', margin: '4px 0' }}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={regForm.phone}
                onChange={(e) => setRegForm({ ...regForm, phone: formatNepaliPhone(e.target.value) })}
                required
                style={{ padding: '8px 15px', margin: '4px 0' }}
              />
              <input
                type="password"
                placeholder="Password"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                required
                style={{ padding: '8px 15px', margin: '4px 0' }}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={regForm.password_confirm}
                onChange={(e) => setRegForm({ ...regForm, password_confirm: e.target.value })}
                required
                style={{ padding: '8px 15px', margin: '4px 0' }}
              />

              <button type="submit" disabled={regLoading} style={{ marginTop: '15px' }}>
                {regLoading ? 'Registering...' : 'Complete Setup'}
              </button>
            </form>
          )}
        </div>
        <div className="form-container sign-in">
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            <span style={{ margin: '15px 0' }}>Use your email or username</span>
            <input
              type="text"
              placeholder="Email or Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <a href="#">Forget Your Password?</a>
            <button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your Government ID to use all portal features</p>
              <button className="hidden" id="register" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
