import "./Signup.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from "../AuthContext";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dropdown1, setDropdown1] = useState('');
  const [dropdown2, setDropdown2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('attempting signup');
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        console.log('signup failed:', data.error);
        return;
      }

      console.log('signup successful');
      login(data.user, data.access_token, data.refresh_token);
      navigate('/verification', { state: { email: email } });
    } catch (err) {
      setError('Network error. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <h1>Sign Up for Homiely</h1>
      <div className="signup-form">
        <div>
          <label>First Name</label>
          <input
            type="text"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="signup-form-full">
          <label>Email</label>
          <input
            type="email"
            placeholder="email@g.ucla.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="signup-form-full">
          <label>Residence Building</label>
          <select
            value={dropdown1}
            onChange={(e) => setDropdown1(e.target.value)}
            className="signup-dropdown"
          >
            <option value="">Select your residence</option>
            <option value="De Neve">De Neve</option>
            <option value="Sproul">Sproul</option>
            <option value="Rieber">Rieber</option>
            <option value="Hedrick">Hedrick</option>
            <option value="Dykstra">Dykstra</option>
            <option value="Covel">Covel</option>
            <option value="Hitch">Hitch</option>
          </select>
        </div>
        <div className="signup-form-full">
          <label>Restroom Type</label>
          <select
            value={dropdown2}
            onChange={(e) => setDropdown2(e.target.value)}
            className="signup-dropdown"
          >
            <option value="">Select restroom type</option>
            <option value="Single">Single</option>
            <option value="Shared">Shared</option>
            <option value="Communal">Communal</option>
          </select>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '...' : 'Sign Up'}
      </button>
      {error && <p className="signup-error">{error}</p>}
      <p>
        Already have an account? <Link to="/login" className="forest-link">Log in</Link>
      </p>
    </div>
  );
}