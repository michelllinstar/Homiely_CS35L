import "./Chores.css";
import {useState} from "react";
import {useNavigate} from 'react-router-dom'
import {Link} from 'react-router-dom'

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
    sunday.setDate(today.getDate() - day);      // Math to figure out how many days ago was Monday
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const format = (d) => d.toLocaleDateString("en-US", {month: "long", day: "numeric"});

    return {start: format(sunday), end: format(saturday)};
}

export default function Chores() {
    const {start, end} = getWeekRange();

    return (
        <div className="chores-page">
            <header>
                <h1 className="chores-title">Chores</h1>
                <p className="chores-week">Week of {start} to {end}</p>
            </header>
        </div>
    );
}