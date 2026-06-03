import "./Verification.css";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../AuthContext";

export default function Verification() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Get email from location state or user context
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // Use a test email if accessing directly (for demo/testing)
      setEmail('test@example.com');
    }
  }, [location, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          verification_code: verificationCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        console.log('verification failed:', data.error);
        return;
      }

      setSuccess('Email verified successfully!');
      console.log('verification successful');
      
      // Redirect to home after brief delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      setError('Network error. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }

      setSuccess('Verification code sent to your email!');
    } catch (err) {
      setError('Network error. Please try again.');
      console.log(err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-container">
        <h1>Verify Your Email</h1>
        <p className="verification-subtitle">
          We've sent a verification code to <strong>{email}</strong>
        </p>

        <div className="verification-card">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-group">
              <label>Enter Verification Code</label>
              <input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength="6"
                disabled={loading}
                className="code-input"
              />
              <p className="helper-text">Check your email for the 6-digit code</p>
            </div>

            <button
              type="submit"
              className="verify-btn"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className="resend-section">
            <p className="resend-text">Didn't receive the code?</p>
            <button
              type="button"
              className="resend-btn"
              onClick={handleResendCode}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
