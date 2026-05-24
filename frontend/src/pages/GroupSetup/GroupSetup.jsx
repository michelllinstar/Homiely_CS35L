import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./GroupSetup.css";

export default function GroupSetup() {
  const [groupName, setGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const saveUserAndGoHome = (user) => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    login(user, accessToken, refreshToken);
    navigate("/home");
  };

  const submitGroupAction = async (url, body) => {
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      saveUserAndGoHome(data.user);
    } catch (err) {
      setError("Network error. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = (e) => {
    e.preventDefault();
    submitGroupAction("/api/groups/create", {
      name: groupName || "My Roommate Group",
    });
  };

  const joinGroup = (e) => {
    e.preventDefault();
    submitGroupAction("/api/groups/join", {
      join_code: joinCode,
    });
  };

  return (
    <div className="group-setup-page">
      <div className="group-setup-panel">
        <p className="group-setup-eyebrow">One last step</p>
        <h1>Set up your home</h1>
        <p className="group-setup-subtitle">
          Create a new roommate group or join one with an invite code.
        </p>

        {error && <p className="group-setup-error">{error}</p>}

        <div className="group-setup-grid">
          <form onSubmit={createGroup} className="group-setup-card">
            <h2>Create a group</h2>
            <label htmlFor="group-name">Home name</label>
            <input
              id="group-name"
              type="text"
              placeholder="Gayley Apartment"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Working..." : "Create group"}
            </button>
          </form>

          <form onSubmit={joinGroup} className="group-setup-card">
            <h2>Join a group</h2>
            <label htmlFor="join-code">Join code</label>
            <input
              id="join-code"
              type="text"
              placeholder="ABC123"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button type="submit" disabled={loading || !joinCode}>
              {loading ? "Working..." : "Join group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
