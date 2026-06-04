import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppNavbar from "../../components/Home_components/AppNavbar";
import HomeTabs from "../../components/Home_components/HomeTabs";
import jerry from "../../assets/jerry.png";

export default function Home() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    async function fetchGroup() {
      if (!user || !accessToken) {
        setLoadingGroup(false);
        return;
      }

      try {
        const res = await fetch("/api/groups/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (data.has_roommate_group) {
          setGroup(data.group);
        }
      } catch (err) {
        console.log("Failed to fetch group:", err);
      } finally {
        setLoadingGroup(false);
      }
    }

    fetchGroup();
  }, [user, accessToken]);

  if (!user) {
    return (
      <div className="home-page">
        <AppNavbar />
        <main className="home-shell">
          <h1>No user is currently logged in!</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <AppNavbar />

      <main className="home-shell">
        <section className="hero-section">
          <div>
            <p className="greeting">Good morning,</p>

            <h1>
              welcome home,
              <br />
              <span>{user.name}.</span>
            </h1>

            <p className="hero-subtitle">
              {loadingGroup
                ? "Loading your roommate group..."
                : group
                  ? `${group.name} is cozy — ${group.members.length} roommates are in your group.`
                  : "Join or create a roommate group to set up your home."}
            </p>

          </div>

          <div className="house-card">
            <img src={jerry} alt="House" style={{ width: '180px', height: '200px', objectFit: 'contain', borderRadius: '12px' }} />
            <p>{group ? group.name : "Homily House"}</p>
          </div>
        </section>

        {group && (
          <section className="stats-grid">
            <div className="stat-card blue">
              <p>Roommates</p>
              <h2>{group.members.length}</h2>
              <span>in your group</span>
            </div>

            <div className="stat-card orange">
              <p>Join code</p>
              <h2>{group.join_code}</h2>
              <span>share with roommates</span>
            </div>
          </section>
        )}

        {loadingGroup ? (
          <div className="panel">
            <h2>Loading roommate group...</h2>
          </div>
        ) : group ? (
          <HomeTabs group={group} />
        ) : (
          <div className="panel empty-group-panel">
            <h2>No roommate group yet</h2>
            <p>Create a new group or join an existing one with an invite code.</p>
            <button
              className="group-setup-button"
              type="button"
              onClick={() => navigate("/group-setup")}
            >
              Join or create a group
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
