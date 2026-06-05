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

/* 
AI Citation  (Page ended up being retired and unused )
[GenAI Use] Prompt: Generate me a template into the backend API for the email verification page. I want to be able to send a verification code and have it check with the backend if it's correct, and then redirect to the home page if it is. I also want a button to resend the verification code, which should call another backend endpoint to resend the code to the user's email. Make sure to handle loading states and error messages appropriately.
[GenAI Use] LLM Response Start

const handleVerify = async () => {
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    const res = await fetch('/api/ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // payload
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Action failed');
      return;
    }

    setSuccess('Action successful!');

    // Redirect after brief delay
    setTimeout(() => {
      navigate('/ROUTE');
    }, 1500);
  } catch (err) {
    setError('Network error. Please try again.');
    console.log(err);
  } finally {
    setLoading(false);
  }
};

const handleResend = async () => {
  setError('');
  setSuccess('');
  setResendLoading(true);

  try {
    const res = await fetch('/api/ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // payload
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Action failed');
      return;
    }

    setSuccess('Action successful!');
  } catch (err) {
    setError('Network error. Please try again.');
    console.log(err);
  } finally {
    setResendLoading(false);
  }
};
GenAI Use] LLM Response End

[GenAI Use] Reflection: I learned about how the front end connects to the backend to handle this 
type of function call. I had the ai genreate me a template for the verification page, and I was able to 
use that template to create the actual page. I also learned about how to handle loading states and error messages appropriately, 
which is important for a good user experience. I also learned about how to use the useNavigate hook from react-router-dom to redirect the user after a successful action. 
Overall, this was a helpful example in understanding how the frontend and backend interact in a web application in a practical use case. although we didnt end up 
doing the backend of this so it's just unused.

*/