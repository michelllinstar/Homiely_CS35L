import "./Landing.css";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";

export default function Landing() {
  
  return (
    <div className="landing-page">
      { /* Navbar will be added here */ }
      <Navbar />
      { /* Main content of the landing page */ }
      <div className="landing-content">
        <h1 className="title">Welcome to Homiely</h1>

        <p className="subtitle">
          Track chores, split expenses, and keep roommate life peaceful.
        </p>
        {/* Middle Screen login and get started buttons */ }
        <div className="button-row">
          <Button label="Sign up" to="/Signup" />
          <Button label="Log in" to="/login" />
        </div>
      </div>
    </div>
  );
}