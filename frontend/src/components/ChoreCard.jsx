import { useState } from "react";
import "./ChoreCard.css";

// Default time if not explicitly set should be any time of day
export default function ChoreCard({ assignee, description, timeOfDay = "Due anytime", checked, onToggle, onDelete }) {
    return (
        <div className="chore-card" style={{ background: checked ? "#f0f0f0" : "#fff" }}>

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
            <p
                className="chore-description"
                style={{
                    textDecoration: checked ? "line-through" : "none",
                    color: checked ? "#aaa" : "#222",
                }}
            >
                {description}
            </p>

            {/* Time of day */}
            <p className="chore-time">{timeOfDay}</p>
        </div>
    );
}