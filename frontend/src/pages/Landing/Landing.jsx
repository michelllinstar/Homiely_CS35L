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

        <p style={{
          fontSize: 19, maxWidth: 580, margin: '0 auto 36px',
          lineHeight: 1.5
        }}>
          Homily is the cozy way to share a home. Track chores, split expenses, and stay in sync —
          without the awkward group chat or the mystery of who bought soap last.
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