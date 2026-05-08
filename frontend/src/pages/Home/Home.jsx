import "./Home.css";

export default function Home() {
  return (
    <div className="landing-page">
      <h1 className="title">Welcome to Homiely</h1>

      <p className="subtitle">
        Track chores, split expenses, and keep roommate life peaceful.
      </p>

      <div className="button-row">
        <button className="login-button">
          Login
        </button>

        <button className="signup-button">
          Sign Up
        </button>
      </div>
    </div>
  );
}