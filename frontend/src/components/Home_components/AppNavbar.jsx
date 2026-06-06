// [GenAI Use] Prompt: "Rename the brand to Homily and the Calendar nav link to Availability (pointing at /availability)."
// [GenAI Use] Reflection: The response handled the rename reliably, updating both the brand text and the nav link target in one pass. I confirmed the link points at /availability and matches the renamed route so navigation doesn't 404. Straightforward and correct.

import "./AppNavbar.css";
import Button from "../Button";
import jerry from "../../assets/jerry.png";
import { useAuth } from "../../pages/AuthContext";

export default function AppNavbar() {
  const { user } = useAuth();

  return (
    <nav className="app-navbar">
      <div className="brand">
          <img src={jerry} alt="House" style={{ width: '40px', height: '60px', objectFit: 'contain', borderRadius: '12px' }} />
        {/* [GenAI Use] LLM Response Start */}
        <h2>Homily</h2>
        {/* [GenAI Use] LLM Response End */}
      </div>

      <div className="nav-links">
        <Button label="Home" to="/home" />
        <Button label="Chores" to="/chores" />
        <Button label="Expenses" to="/expenses" />
        {/* [GenAI Use] LLM Response Start */}
        <Button label="Availability" to="/availability" />
        {/* [GenAI Use] LLM Response End */}
      </div>

      {/* 6/3 12:48 am: added user profile button to link to profile page */}
      <div className="nav-user">
        <span className="group-pill">● Sproutwood · 412B</span>
        <Button label={user?.name?.[0] || "U"} to="/profile" className="avatar-btn" />

      </div>
    </nav>
  );
}