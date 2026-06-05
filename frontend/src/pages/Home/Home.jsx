import "./Home.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppNavbar from "../../components/Home_components/AppNavbar";
import HomeTabs from "../../components/Home_components/HomeTabs";
import { getAmountOwedToUser } from "../../utils/balances";
import { getOpenChoresCount, getWeekStartDate } from "../../utils/chores";
import jerry from "../../assets/jerry.png";

// [GenAI Use] Prompt: "Role: React tutor. Context: My Home page should show a logged-in user's roommate group, current open chores, and amount owed to them from shared expenses. Task: Give me a fill-in React template for this component, not final code. Criteria: Include TODO placeholders for route names, helper functions, and state names; avoid Promise.all; add beginner-friendly comments explaining less common React/JavaScript syntax."
// [GenAI Use] LLM Response Start
/* Fill-in template:
    // TODO: import any helper functions that do repeated math or date work.
    // Example: import { someHelper } from "../../utils/someFile";

    export default function Home() {
        // TODO: get the logged-in user and token from your auth context.
        const { user, accessToken } = useAuth();

        // TODO: store data that comes from the backend.
        // useState returns an array: [currentValue, functionToUpdateValue].
        const [group, setGroup] = useState(null);
        const [stats, setStats] = useState({
            // TODO: replace these keys with the cards you want to show.
            firstCardValue: 0,
            secondCardValue: 0,
        });

        // First effect: fetch the group.
        // useEffect runs after render and reruns when the dependency array changes.
        useEffect(() => {
            async function fetchGroup() {
                // TODO: fetch the route that returns the current user's group.
                const res = await fetch("TODO_GROUP_ROUTE", {
                    headers: {
                        // Bearer token tells the backend who is logged in.
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const data = await res.json();
                // TODO: store the group if the backend says one exists.
                setGroup(data.group);
            }

            fetchGroup();
        }, [user, accessToken]);

        // Second effect: fetch data that depends on the group.
        useEffect(() => {
            async function fetchStats() {
                if (!group) return;

                // TODO: fetch chores first.
                const choresRes = await fetch("TODO_CHORES_ROUTE");
                const chores = await choresRes.json();

                // TODO: fetch expenses second.
                const expensesRes = await fetch("TODO_EXPENSES_ROUTE");
                const expenses = await expensesRes.json();

                setStats({
                    // TODO: call helper functions or write calculations here.
                    firstCardValue: TODO_CHORE_HELPER(chores, user.id),
                    secondCardValue: TODO_EXPENSE_HELPER(expenses, user.id),
                });
            }

            fetchStats();
        }, [group, user, accessToken]);
    } */
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I used this as a planning template instead of copying it directly. I filled in our real routes, helper functions, state names, loading states, and JSX layout for Homiely.

// -----------------------------------------------------------------------------------------------------------------------
// Home is the main dashboard page after login
// Whenever React loads /home, it will check if the user is authenticated (via ProtectedRoute in app.jsx). If so, this component will render and pull in the user's group and home stats to display.
// -----------------------------------------------------------------------------------------------------------------------
export default function Home() {
  // ProtectedRoute makes sure user exists before this page renders.
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  // -----------------------------------------------------------------------------------------------------------------------
  // useState to track the main pieces of data we need: group info and the stats for the cards. Each has its own loading state so we can show partial data as it comes in.
  // Group data controls most of the page.
  // -----------------------------------------------------------------------------------------------------------------------
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  // These cards come from chores and expenses.
  const [homeStats, setHomeStats] = useState({
    // Initial value
    openChores: 0,
    owedToMe: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Get the user's roommate group first. Other home data depends on it
  // useEffect runs code when component loads or when dependencies change
  useEffect(() => {
    async function fetchGroup() {
      // If there's no user or access token, we can't fetch group data
      if (!user || !accessToken) {
        setLoadingGroup(false);
        return;
      }

      // Call to backend
      // If the user is in a group, we'll get the group data. If not, we'll just show the empty state.
      try {
        const res = await fetch("/api/groups/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Backend sends group data if user is in a group, or 404 if not. Both are expected, so we handle them gracefully
        const data = await res.json();
        // If the user is in a group, store it. Otherwise we'll show the empty state 
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

  // Pull the current week's chores and current expense balances for the cards
  useEffect(() => {
    async function fetchHomeStats() {
      if (!user || !accessToken || !group) return;
      setLoadingStats(true);

      try {
        const choresRes = await fetch(
          `/api/groups/${group.id}/chores?week_start=${getWeekStartDate()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const expensesRes = await fetch(`/api/expenses/${group.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!choresRes.ok || !expensesRes.ok) {
          console.log("Could not load home stats.");
          return;
        }

        const chores = await choresRes.json();
        const expenses = await expensesRes.json();
        const userId = Number(user.id);

        // Only count chores assigned to this user that are not done yet.
        setHomeStats({
          openChores: getOpenChoresCount(chores, userId),
          owedToMe: getAmountOwedToUser(expenses, userId),
        });
      } catch (err) {
        console.log("Failed to fetch home stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchHomeStats();
  }, [user, accessToken, group]);

  // The user can be logged in but still not have a roommate group.
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
              {/* Show the right message for loading, grouped, and no-group states. Nested If-statements*/}
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

        {/* These cards only make sense after a group exists. */}
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

        {/* Main content area: loading, roommate list, or setup prompt. */}
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
