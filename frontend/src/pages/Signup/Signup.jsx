import "./Signup.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from "../AuthContext";

//all of rthe fields
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

    // Validation to check if all the fields are filledout and if passwords match logic below
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

    //method of connected to database
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
//for a correct signup, we log the user in and navigate to the group setup page
      console.log('signup successful');
      login(data.user, data.access_token, data.refresh_token);
      navigate('/group-setup', { state: { email: email } });
    } catch (err) {
      //otherwise it shows the error message
      setError('Network error. Please try again.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  //Stuff to make the visual stuff display
  return (
    <div className="signup-page">
      <h1>Sign Up for Homily</h1>
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
          //dropdown for the residence building and restroom types, two dropdowns (ai templated, cited below)
            value={dropdown1}
            onChange={(e) => setDropdown1(e.target.value)}
            className="signup-dropdown"
          >
            <option value="Centennial">Centennial</option>
            <option value="De Neve">De Neve</option>
            <option value="Dykstra">Dykstra</option>
            <option value="Gardenia">Gardenia</option>
            <option value="Hedrick">Hedrick</option>
            <option value="Hedrick Summit">Hedrick Summit</option>
            <option value="Hitch">Hitch</option>
            <option value="Holly">Holly</option>
            <option value="Olympic">Olympic</option>
            <option value="Rieber">Rieber</option>
            <option value="Rieber Terrace">Rieber Terrace</option>
            <option value="Rieber Vista">Rieber Vista</option>
            <option value="Saxon">Saxon</option>
            <option value="Sproul">Sproul</option>
            <option value="Sproul Cove">Sproul Cove</option>
            <option value="Sproul Landing">Sproul Landing</option>
            <option value="Sunset Village">Sunset Village</option>
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


/* 
AI Citation 
[GenAI Use] Prompt: Generate me a template example of two drop down menus for the signup page. 
One for the "residence building" and "restrool type fields". include blank fields for options.
[GenAI Use] LLM Response Start

<div className="signup-form-full">
  <label>Dropdown Label</label>
  <select
    value={dropdown1}
    onChange={(e) => setDropdown1(e.target.value)}
    className="signup-dropdown"
  >
    <option value="Option">Option</option>
  </select>
</div>

<div className="signup-form-full">
  <label>Dropdown Label</label>
  <select
    value={dropdown2}
    onChange={(e) => setDropdown2(e.target.value)}
    className="signup-dropdown"
  >
    <option value="">Select option</option>
    <option value="Option">Option</option>
  </select>
</div>

GenAI Use] LLM Response End

[GenAI Use] Reflection: I learned about how to create a dropdown menu in React using the <select> element 
and how to manage its state with the useState hook. I also learned how to fill out the dropdown with options and 
handle changes to the selected value. This was super useful for creating forms that require users to select from a 
predefined list of options, such as residence buildings or restroom types in our signup page.

*/