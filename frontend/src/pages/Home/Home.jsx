 import "./Home.css";
import { useAuth } from "../AuthContext";
import AppNavbar from "../../components/Home_components/AppNavbar";
import HomeTabs from "../../components/Home_components/HomeTabs";
export default function Home() {
  const { user } = useAuth();

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
              The hall is cozy — 2 of your roommates are home. You have 2 chores left this week.
            </p>

            <div className="hero-buttons">
              <button>See my chores</button>
              <button className="secondary-button">$49.10 owed to you</button>
            </div>
          </div>

          <div className="house-card">
            🏡
            <p>Homily House</p>
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
            <p>Free together</p>
            <h2>Sat 6pm</h2>
            <span>all 4 available</span>
          </div>

          <div className="stat-card orange">
            <p>Pip's mood</p>
            <h2>🌿 cozy</h2>
            <span>house is tidy</span>
          </div>
        </section>

        <HomeTabs />

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