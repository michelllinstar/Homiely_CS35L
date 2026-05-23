import "./Chores.css";
import { useState } from "react";
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import WeekView from "../../components/WeekView";
import YourWeek from "../../components/YourWeek";
import AddChore from "../../components/AddChores";


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

const initialChores = {
    Sunday: [
        { assignee: "HD", description: "Take out trash", timeOfDay: "Due anytime", checked: false },
    ],
    Monday: [
        { assignee: "HD", description: "Vacuum living room", timeOfDay: "Due anytime", checked: false },
        { assignee: "SM", description: "Do laundry", timeOfDay: "Due 2:00 PM", checked: false },
    ],
    Wednesday: [
        { assignee: "SM", description: "Clean bathrooms", timeOfDay: "Due 10:00 AM", checked: false },
    ],
    Friday: [
        { assignee: "HD", description: "Mop kitchen floor", timeOfDay: "Due 6:00 PM", checked: false },
        { assignee: "AA", description: "Clean stovetop", timeOfDay: "Due anytime", checked: false },
    ],
};

const currentUser = "HD";

export default function Chores() {
    const { start, end } = getWeekRange();
    const [chores, setChores] = useState(initialChores);

    function handleToggle(day, index) {
        setChores((prev) => ({
            ...prev,
            [day]: prev[day].map((chore, i) =>
                i === index ? { ...chore, checked: !chore.checked } : chore
            ),
        }));
    }

    function handleAddChore(newChore) {
        setChores((prev) => ({
            ...prev,
            [newChore.day]: [...(prev[newChore.day] || []), newChore],
        }));
    }

    return (
        <div className="chores-page">
            <header>
                <h1 className="chores-title">Chores</h1>
                <p className="chores-week">Week of {start} to {end}</p>
            </header>
            <WeekView chores={chores} onToggle={handleToggle} />
            <div className="chores-bottom">
                <YourWeek chores={chores} currentUser={currentUser} onToggle={handleToggle} />
                <AddChore onAddChore={handleAddChore} />
            </div>
        </div>
    );
}