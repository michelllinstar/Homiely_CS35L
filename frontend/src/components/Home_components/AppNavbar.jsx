import "./AppNavbar.css";
import Button from "../Button";
import { useAuth } from "../../pages/AuthContext";

export default function AppNavbar() {
  const { user } = useAuth();

  return (
    <nav className="app-navbar">
      <div className="brand">
        <span>🏠</span>
        <h2>Homily</h2>
      </div>

      <div className="nav-links">
        <Button label="Home" to="/home" />
        <Button label="Chores" to="/chores" />
        <Button label="Expenses" to="/expenses" />
        <Button label="Calendar" to="/calendar" />
      </div>

      {/* 6/3 12:48 am: added user profile button to link to profile page */}
      <div className="nav-user">
        <span className="group-pill">● Sproutwood · 412B</span>
        <Button label={user?.name?.[0] || "U"} to="/profile" className="avatar-btn" />

      </div>
    </nav>
  );
}