import "./Login.css";
import {useState} from 'react';
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [successfulLogin, setSuccessfulLogin] = useState(false);
  const [badLogin, setBadLogin] = useState(false);
  const navigate = useNavigate();

  function checkValidCredentials(email, password) {
    return email && password;
  }

  // placeholder for backend: fetch 
  function handleSubmit() {
    if (checkValidCredentials(email, password)) {
      // setSuccessfulLogin(true);
      console.log("success!!!!");
      console.log(email);
      console.log(password);
      navigate("/");
    } else {
      console.log("unsuccessful login. invalid email or password");
      setBadLogin(true);
    }
  }

  return (
    <div className="login-page">
        <h1>Log In to Homiely</h1>
        <div>
          <label>
            Email
          </label>
          <input
            type="email"
            placeholder="email@g.ucla.edu"
            value={email}
            onChange = {e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange = {e => setPassword(e.target.value)}            
          />
        </div>
        <button onClick={handleSubmit}>Log In</button>
        {badLogin && <p className="login-error">Invalid email or password.</p>}
        <p>No account? <Link to="/signup" className="forest-link">Sign up</Link></p>

    </div>
  );
}