import React, { useState } from "react";
import ChoreCard from "./ChoreCard";
import "./CalendarAvailMo.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

export default function CalendarChoreMo({ chores = {}, onToggle, onDelete }) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(
            <div key={`empty-${i}`} className="cam-month-cell cam-month-cell-empty" />
        );
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDateKey(year, month, day);
        const dayChores = chores[dateKey] || [];
        const isToday = day === today.getDate();

        cells.push(
            <div
                key={day}
                className={`cam-month-cell ${isToday ? "cam-month-cell-today" : ""}`}
                style={{ aspectRatio: "unset", minHeight: "80px" }}
            >
                <div className="cam-month-date">{day}</div>
                {dayChores.map((chore) => (
                    <ChoreCard
                        key={chore.id}
                        assignee={chore.assignee}
                        description={chore.description}
                        timeOfDay={chore.timeOfDay}
                        checked={chore.checked}
                        day={chore.day}
                        onToggle={() => onToggle(chore.id)}
                        onDelete={() => onDelete(chore.id)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="cam">
            <div className="cam-month-header">
                {WEEKDAYS.map((d) => (
                    <div key={d} className="cam-month-day-label">{d}</div>
                ))}
            </div>
            <div className="cam-month-grid">
                {cells}
            </div>
        </div>
    );
}