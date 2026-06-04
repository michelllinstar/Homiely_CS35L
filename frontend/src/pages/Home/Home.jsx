import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppNavbar from "../../components/Home_components/AppNavbar";
import HomeTabs from "../../components/Home_components/HomeTabs";
import jerry from "../../assets/jerry.png";

function getWeekStartDate() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return sunday.toISOString().split("T")[0];
}

function calculateAmountOwedToUser(expenses, userId) {
  const balances = {};

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => {
      if (split.is_paid || split.owed_by === expense.paid_by) return;

      const key = `${split.owed_by}-${expense.paid_by}`;
      const reverseKey = `${expense.paid_by}-${split.owed_by}`;

      if (balances[reverseKey]) {
        balances[reverseKey] -= split.amount;
      } else {
        balances[key] = (balances[key] || 0) + split.amount;
      }
    });
  });

  return Object.entries(balances).reduce((total, [key, amount]) => {
    const [, owedId] = key.split("-").map(Number);
    return owedId === userId && amount > 0 ? total + amount : total;
  }, 0);
}

export default function Home() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [homeStats, setHomeStats] = useState({
    openChores: 0,
    owedToMe: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

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

  useEffect(() => {
    async function fetchHomeStats() {
      if (!user || !accessToken || !group) return;

      setLoadingStats(true);

      try {
        const [choresRes, expensesRes] = await Promise.all([
          fetch(`/api/groups/${group.id}/chores?week_start=${getWeekStartDate()}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          fetch(`/api/expenses/${group.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        ]);

        if (!choresRes.ok || !expensesRes.ok) {
          console.log("Could not load home stats.");
          return;
        }

        const chores = await choresRes.json();
        const expenses = await expensesRes.json();
        const userId = Number(user.id);

        setHomeStats({
          openChores: chores.filter(
            (chore) => chore.assigned_to === userId && !chore.is_completed
          ).length,
          owedToMe: calculateAmountOwedToUser(expenses, userId),
        });
      } catch (err) {
        console.log("Failed to fetch home stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchHomeStats();
  }, [user, accessToken, group]);

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
            <div className="stat-card green">
              <p>My open chores</p>
              <h2>{loadingStats ? "..." : homeStats.openChores}</h2>
              <span>for this week</span>
            </div>

            <div className="stat-card peach">
              <p>Owed to me</p>
              <h2>{loadingStats ? "..." : `$${homeStats.owedToMe.toFixed(2)}`}</h2>
              <span>unpaid group balance</span>
            </div>

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
