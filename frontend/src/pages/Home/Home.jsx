import "./Home.css";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import AppNavbar from "../../components/Home_components/AppNavbar";
import HomeTabs from "../../components/Home_components/HomeTabs";
import jerry from "../../assets/jerry.png";

export default function Home() {
  const { user, accessToken } = useAuth();

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
              {group
                ? `${group.name} is cozy — ${group.members.length} roommates are in your group.`
                : "Loading your roommate group..."}
            </p>

            <div className="hero-buttons">
              <button>See my chores</button>
              <button className="secondary-button">$49.10 owed to you</button>
            </div>
          </div>

          <div className="house-card">
            <img src={jerry} alt="House" style={{ width: '180px', height: '200px', objectFit: 'contain', borderRadius: '12px' }} />
            <p>{group ? group.name : "Homily House"}</p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Today's chores</p>
            <h2>3</h2>
            <span>2 still open</span>
          </div>

          <div className="stat-card peach">
            <p>Group balance</p>
            <h2>$49.10</h2>
            <span>owed to you</span>
          </div>

          <div className="stat-card blue">
            <p>Roommates</p>
            <h2>{group ? group.members.length : "..."}</h2>
            <span>{group ? "in your group" : "loading"}</span>
          </div>

          <div className="stat-card orange">
            <p>Join code</p>
            <h2>{group ? group.join_code : "..."}</h2>
            <span>share with roommates</span>
          </div>
        </section>

        {loadingGroup ? (
          <div className="panel">
            <h2>Loading roommate group...</h2>
          </div>
        ) : (
          <HomeTabs group={group} />
        )}

        <section className="bottom-grid">
          <div className="panel">
            <h2>Around the house</h2>
            <p>✅ Emma checked off Take out kitchen trash</p>
            <p>🧾 Thomas added $24.00 — Toilet paper</p>
            <p>🧹 Jerry completed Vacuum living room</p>
          </div>

          <div className="panel">
            <h2>Up next</h2>
            <p>🧹 Mop kitchen floor</p>
            <p>Today · 7:00 PM · You</p>
          </div>
        </section>
      </main>
    </div>
  );
}
