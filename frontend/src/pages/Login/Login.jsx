import "./Login.css";
import {useState} from 'react';
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'
import { useAuth } from "../AuthContext";


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [successfulLogin, setSuccessfulLogin] = useState(false);
  const [badLogin, setBadLogin] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();



  function checkValidCredentials(email, password) {
    return email && password;
  }

  // placeholder for backend: fetch 
  const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // if (checkValidCredentials(email, password)) {
    //   // setSuccessfulLogin(true);
    //   console.log("success!!!!");
    //   console.log(email);
    //   console.log(password);
    //   navigate("/");
    // } else {
    //   console.log("unsuccessful login. invalid email or password");
    //   setBadLogin(true);
    // }

    try {
      console.log("trying to do a post command on /api/login")
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"email": email, "password": password}),
      });

      const data = await res.json();

      if (!res.ok) {
        setBadLogin(true);
        console.log("login failed because of ", data.error);
        setError(data.error || "Login failed");
        return;
      }
      setBadLogin(false);
      console.log("login successful");
      login(data.user, data.access_token, data.refresh_token);
      navigate("/home");
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err)
    } finally {
      console.log("loading done")
      setLoading(false);
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
        <button onClick={handleSubmit} disabled={loading}>{loading ? "..." : "Log In"}</button>
        {badLogin && <p className="login-error">Invalid email or password.</p>}
        <p>No account? <Link to="/signup" className="forest-link">Sign up</Link></p>

    </div>
  );
}