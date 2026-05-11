import "./Navbar.css";
import Button from "./Button";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        🏠 Homiely
      </div>

      <div className="navbar-links">
        <button className="nav-text-button">
          Features
        </button>

        <button className="nav-text-button">
          How it works
        </button>

        <button className="nav-text-button">
          About
        </button>

        <Button label="Log in" to="/login" />
        <Button label="Get started" to="/signup" />
      </div>
    </nav>
  );
}