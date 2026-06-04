import "./Login.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Navbar from "../../components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [badLogin, setBadLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBadLogin(true);
        setError(data.message || "Login failed");
        return;
      }

      setBadLogin(false);
      login(data.user, data.access_token, data.refresh_token);

      if (data.user.has_roommate_group) {
        navigate("/home");
      } else {
        navigate("/group-setup");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="login-page">
      <h1>Log In to Homiely</h1>

      <form onSubmit={handleSubmit}>
        <div>
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

        <button type="submit" disabled={loading}>
          {loading ? "..." : "Log In"}
        </button>
      </form>

      {badLogin && <p className="login-error">Invalid email or password.</p>}
      {error && <p className="login-error">{error}</p>}

      <p>
        No account?{" "}
        <Link to="/signup" className="forest-link">
          Sign up
        </Link>
      </p>
    </div>
    </div>
    
  );
}