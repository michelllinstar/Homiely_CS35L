import { useState } from "react";
import "./ChoreCard.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* Returns true if the chore's due time has already passed and it isn't completed. */
// [GenAI Use] Refer to ChoreCard.css for prompt and reflection.
function isOverdue(day, timeOfDay, checked) {
    if (checked) return false;

    const todayIndex = new Date().getDay();
    const choreDayIndex = DAYS.indexOf(day);

    // Day has already passed this week
    if (choreDayIndex < todayIndex) return true;

    // Same day — check if the specific time has passed
    if (choreDayIndex === todayIndex && timeOfDay !== "Due anytime") {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const match = timeOfDay.match(/Due (\d+):(\d+) (AM|PM)/);
        if (match) {
            let [_, hour, minutes, period] = match;
            hour = parseInt(hour);
            minutes = parseInt(minutes);
            if (period === "PM" && hour !== 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;
            if (currentMinutes > hour * 60 + minutes) return true;
        }
    }

    return false;
}

// Default time if not explicitly set should be any time of day
export default function ChoreCard({ assignee, description, timeOfDay = "Due anytime", checked, onToggle, onDelete, day }) {
    const overdue = isOverdue(day, timeOfDay, checked);

    const cardClass = checked
        ? "chore-card chore-card-completed"
        : overdue
        ? "chore-card chore-card-overdue"
        : "chore-card chore-card-pending";

    return (
        <div className={cardClass}>

            {/* Top row: checkbox + assignee initials */}
            <div className="chore-card-top">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onToggle}
                    className="chore-checkbox"
                />
                <span className="chore-assignee">{assignee}</span>
                {/* Delete button */}
                {onDelete && (
                    <button className="chore-delete" onClick={onDelete}>✕</button>
                )}
            </div>

            {/* Chore description */}
            <p className={`chore-description ${checked ? "chore-description-completed" : ""}`}>
                {description}
            </p>

            {/* Time of day */}
            <p className="chore-time">{timeOfDay}</p>
        </div>
    );
}