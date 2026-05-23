import "./Navbar.css";
import Button from "./Button";

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        🏠 Homiely
      </div>

      <div className="navbar-links">
        <button className="nav-text-button" onClick={() => scrollTo("features")}>
          Features
        </button>

        <button className="nav-text-button" onClick={() => scrollTo("how-it-works")}>
          How it works
        </button>

        <button className="nav-text-button" onClick={() => scrollTo("about")}>
          About
        </button>

        <Button label="Log in" to="/login" className="nav-auth-button nav-auth-login" />
        <Button label="Get started" to="/signup" className="nav-auth-button nav-auth-signup" />
      </div>
    </nav>
  );
}
