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

      <div className="nav-user">
        <span className="group-pill">● Sproutwood · 412B</span>
        <span className="avatar">{user?.name?.[0] || "U"}</span>
      </div>
    </nav>
  );
}