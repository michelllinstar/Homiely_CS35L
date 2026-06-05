// [GenAI Use] Prompt: "Show the shared EmptyState when the user is logged out or not in a roommate group, matching the other pages."
// [GenAI Use] Reflection: The response was good — it added the logged-out and no-group guards matching the other pages, keeping the empty-state behavior consistent. I verified both guards render and route to /login and /group-setup respectively, and that they sit after the hooks so React's rules-of-hooks aren't violated. No fixes needed beyond confirming the routing.

import "./Chores.css";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import WeekView from "../../components/WeekView";
import YourWeek from "../../components/YourWeek";
import AddChore from "../../components/AddChores";
import AppNavbar from "../../components/Home_components/AppNavbar";
import EmptyState from "../../components/EmptyState";
import { getWeekStartDate } from "../../utils/chores";
import CalendarChoreMo from "../../components/CalendarChoreMo";


const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// [GenAI Use] Prompt: "How can I use React's built in time/day functions to write a function getWeekRange() to return the start and end of the current week we're on, formatted as month (in words) and day (number)?"
// [GenAI Use] LLM Response Start
/* React doesn't have its own date functions — you'd use plain JavaScript's built-in Date API for this. Here's how to write getWeekRange():
    function getWeekRange() {
        const today = new Date();
        const day = today.getDay();
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - day);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        
        const fmt = (d) =>
            d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
        
        return { start: fmt(sunday), end: fmt(saturday) };
    } */
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: This will help me with the interface for the chores tracker that displays the current week we're on for the user to navigate between weeks of chores. I'm using generative AI here as I'm unfamiliar with JS's built-in timekeeping abilities, and I wanted help with the math to figure out the start and end of the week. I will update this code using clearer variable names and helpful comments.

/* Returns display-formatted start and end of the current week for header subtitle. */
function getWeekRange() {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);      // Math to figure out how many days ago was Sunday
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const format = (d) => d.toLocaleDateString("en-US", { month: "long", day: "numeric" });

    return { start: format(sunday), end: format(saturday) };
}

/* Since the backend returns a flat array, group by day for the WeekView component. */
function groupChoresByDay(choresArray, roommates) {
    const grouped = {};
    DAYS.forEach((day) => (grouped[day] = []));
    choresArray.forEach((chore) => {
        if (grouped[chore.day_of_week] !== undefined) {
            const roommate = roommates.find((r) => r.id === chore.assigned_to);
            grouped[chore.day_of_week].push({
                id: chore.id,
                assignee: roommate ? roommate.name : "Unassigned",
                description: chore.description,
                timeOfDay: chore.time_of_day,
                checked: chore.is_completed,
            });
        }
    });

    // Sort each day's chores by time due, with "Due anytime" last
    DAYS.forEach((day) => {
        grouped[day].sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));
    });

    return grouped;
}

/* [GenAI Use] Prompt: "Here is my function that turns a flat array of chore information into chores grouped by day:
function groupChoresByDay(choresArray, roommates) {
    const grouped = {};
    DAYS.forEach((day) => (grouped[day] = []));
    choresArray.forEach((chore) => {
        if (grouped[chore.day_of_week] !== undefined) {
            const roommate = roommates.find((r) => r.id === chore.assigned_to);
            grouped[chore.day_of_week].push({
                id: chore.id,
                assignee: roommate ? roommate.name: "Unassigned",
                description: chore.description,
                timeOfDay: chore.time_of_day,
                checked: chore.is_completed
            });
        }
    });
    return grouped;
}
Is there a way to reorder each day's chores by time due? due anytime could be last on the list."" */
// [GenAI Use] LLM Response Start
/* "Yes, sort the chores array after pushing them all in, inside groupChoresByDay. Add a helper function to convert the time string to a sortable number:
jsx// "Due anytime" sorts last; "Due 7:00 AM" etc. convert to minutes since midnight
function timeToMinutes(timeOfDay) {
    if (!timeOfDay || timeOfDay === "Due anytime") return Infinity;
    const match = timeOfDay.match(/Due (\d+):(\d+) (AM|PM)/);
    if (!match) return Infinity;
    let [_, hour, minutes, period] = match;
    hour = parseInt(hour);
    minutes = parseInt(minutes);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minutes;
}
Then sort at the end of groupChoresByDay:
jsxfunction groupChoresByDay(choresArray, roommates) {
    const grouped = {};
    DAYS.forEach((day) => (grouped[day] = []));
    choresArray.forEach((chore) => {
        if (grouped[chore.day_of_week] !== undefined) {
            const roommate = roommates.find((r) => r.id === chore.assigned_to);
            grouped[chore.day_of_week].push({
                id: chore.id,
                assignee: roommate ? roommate.name : "Unassigned",
                description: chore.description,
                timeOfDay: chore.time_of_day,
                checked: chore.is_completed,
            });
        }
    });

    // Sort each day's chores by time due, with "Due anytime" last
    DAYS.forEach((day) => {
        grouped[day].sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));
    });

    return grouped;
}" */
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: When visually testing my work, I realized that the chores only show up below each day in the order they were created, not in the order they are due (earliest to latest), which is less user-friendly. Given this is mostly a visual change, I have more pressing things to work on, and I was a little stuck on how to implement this, I asked Claude to help out with this one. I think I understand the code after looking through it, and I will test it before using it for certain.


// "Due anytime" sorts last; "Due 7:00 AM" etc. convert to minutes since midnight
function timeToMinutes(timeOfDay) {
    if (!timeOfDay || timeOfDay === "Due anytime") return Infinity;
    const match = timeOfDay.match(/Due (\d+):(\d+) (AM|PM)/);
    if (!match) return Infinity;
    let [_, hour, minutes, period] = match;
    hour = parseInt(hour);
    minutes = parseInt(minutes);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour * 60 + minutes;
}

/* Converts the day-grouped chores state into the date-keyed format CalendarChoreMo expects: { "YYYY-MM-DD": ["description1", "description2"] } */
function choresToDateKeyed(chores, weekStartDate) {
    const result = {};
    const [year, month, day] = weekStartDate.split("-").map(Number);

    DAYS.forEach((dayName, index) => {
        const date = new Date(year, month - 1, day + index);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const dayChores = chores[dayName] || [];
        if (dayChores.length > 0) {
            result[dateKey] = dayChores.map((c) => ({ ...c, day: dayName }));
        }
    });

    return result;
}

export default function Chores() {
    const { start, end } = getWeekRange();      // Week label for header
    const { user } = useAuth();     // Logged-in user from auth context
    const [chores, setChores] = useState({});   // Chores grouped by day from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roommates, setRoommates] = useState([]);
    const [viewMode, setViewMode] = useState("week");  // "week" or "month"


    const token = localStorage.getItem("access_token");     // JWT for authorizing API reqs
    const groupId = user?.roommate_group_id;        // Roommate group

    /* Fetch chores once on mount or when user/group changes; skip fetch if auth info isn't available. */
    useEffect(() => {
        if (!user || !groupId) {
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [choresRes, roommatesRes] = await Promise.all([
                    fetch(`/api/groups/${groupId}/chores?week_start=${getWeekStartDate()}`,
                        { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`/api/groups/${groupId}/members`,
                        { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                if (!choresRes.ok || !roommatesRes.ok) {
                    setError("Could not load chores. Please try logging in again.");
                    return;
                }
                const choresData = await choresRes.json();
                const roommatesData = await roommatesRes.json();
                setChores(groupChoresByDay(choresData, roommatesData));
                setRoommates(roommatesData);
            } 
            catch (err) {
                console.error("Failed to fetch data:", err);
            } 
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId, token, user]);

    async function handleDelete(day, index, choreId) {
        try {
            const response = await fetch(`/api/chores/${choreId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                console.error("Failed to delete chore");
                return;
            }
            setChores((prev) => ({
                ...prev,
                [day]: prev[day].filter((_, i) => i !== index),
            }));
        } 
        catch (err) {
            console.error("Failed to delete chore:", err);
        }
    }

    /* Send PATCH request to flip a chore's completion status and update UI. */
    async function handleToggle(day, index) {
        const chore = chores[day][index];
        try {
            await fetch(`/api/chores/${chore.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_completed: !chore.checked})
            });
            setChores((prev) => ({
            ...prev,
            [day]: prev[day].map((chore, i) =>
                i === index ? { ...chore, checked: !chore.checked } : chore
            )
            }));
        }
        catch (err) {
            console.error("Failed to update chore:", err);
        }
    }

    /* Send POST request to create new chore and appendto local state. */
    async function handleAddChore(newChore) {
        try {
            const response = await fetch(`/api/groups/${groupId}/chores`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description: newChore.description,
                    assigned_to: newChore.assignee,
                    day_of_week: newChore.day,
                    time_of_day: newChore.timeOfDay,
                    week_start_date: getWeekStartDate(),
                })
            });
            if (!response.ok) {
                console.error("Failed to create chore:", await response.json());
                return;
            }
            const created = await response.json();
            const roommate = roommates.find((r) => r.id === parseInt(created.assigned_to));
            setChores((prev) => {
                const updatedDay = [...(prev[newChore.day] || []), {
                    id: created.id,
                    assignee: roommate ? roommate.name : "Unassigned",
                    description: created.description,
                    timeOfDay: created.time_of_day,
                    checked: created.is_completed,
                }].sort((a, b) => timeToMinutes(a.timeOfDay) - timeToMinutes(b.timeOfDay));
                return { ...prev, [newChore.day]: updatedDay };
            });
        } catch (err) {
            console.error("Failed to create chore:", err);
        }
    }

    async function handleToggleById(choreId) {
        for (const day of DAYS) {
            const index = (chores[day] || []).findIndex((c) => c.id === choreId);
            if (index !== -1) {
                await handleToggle(day, index);
                return;
            }
        }
    }

    async function handleDeleteById(choreId) {
        for (const day of DAYS) {
            const index = (chores[day] || []).findIndex((c) => c.id === choreId);
            if (index !== -1) {
                await handleDelete(day, index, choreId);
                return;
            }
        }
    }

    // Show loading indicator while waiting for API response. */
    if (loading) return <div className="chores-page"><p>Loading...</p></div>;

    // Authentication guard.
    if (!user) {
        return (
            <div className="chores-page">
                <EmptyState
                    title="Chores"
                    message="Please log in to view chores."
                    actionLabel="Log in"
                    actionTo="/login"
                />
            </div>
        );
    }

    // Group setup guard.
    if (!groupId) {
        return (
            <div className="chores-page">
                <AppNavbar />
                <EmptyState
                    title="Chores"
                    message="You need to create or join a roommate group before tracking chores."
                    actionLabel="Set up roommate group"
                    actionTo="/group-setup"
                />
            </div>
        );
    }
    return (
        <div className="chores-page">
            <AppNavbar />
            <header className="chores-header">
                <h1 className="chores-title">Chores</h1>
                <p className="chores-week">Week of {start} to {end}</p>
                {/* [GenAI Use] Prompt: "Left-align the Chores title, then make the month/week button a segmented control matching the Availability page's toggle, and move it below the 'Week of' line." */}
                {/* [GenAI Use] Reflection: The response was mostly good — reusing Availability's .toggleview markup keeps the two pages consistent and avoided me hand-rolling a new control. However, it wasn't perfect: the first suggestion kept the empty header spacer div, which left the title centered, so I removed that myself to get the left alignment I wanted. It also originally hardcoded the labels as separate buttons rather than mapping over the modes, so I refactored it into a ["week", "month"].map to cut the duplication and make adding views easier later. I tested both segments and confirmed the active class tracks viewMode correctly. */}
                <div className="toggleview">
                    {["week", "month"].map((mode) => (
                        <button
                            key={mode}
                            className={`toggleview-btn ${viewMode === mode ? "active" : ""}`}
                            onClick={() => setViewMode(mode)}
                        >
                            {mode === "week" ? "Week" : "Month"}
                        </button>
                    ))}
                </div>
            </header>
            {error && <p className="chores-error">{error}</p>}

            {viewMode === "week" ? (
                <>
                    <div className="chores-card">
                        <WeekView chores={chores} onToggle={handleToggle} onDelete={handleDelete} />
                    </div>
                    <div className="chores-bottom">
                        <div className="chores-card">
                            <YourWeek chores={chores} currentUser={user?.name} onToggle={handleToggle} onDelete={handleDelete} />
                        </div>
                        <div className="chores-card">
                            <AddChore onAddChore={handleAddChore} roommates={roommates} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="chores-card">
                    <CalendarChoreMo
                        chores={choresToDateKeyed(chores, getWeekStartDate())}
                        onToggle={handleToggleById}
                        onDelete={handleDeleteById}
                    />
                </div>
            )}
        </div>
    );
}
