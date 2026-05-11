import React, { useState } from "react";
import "./Calendar.css";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Sample chore data — replace or load from props/API as needed.
// Keys are ISO date strings (YYYY-MM-DD) for easy lookup.
const SAMPLE_CHORES = {
    "2026-05-10": ["Take out trash", "Water plants"],
    "2026-05-12": ["Laundry", "Vacuum"],
    "2026-05-15": ["Grocery shopping"],
};

function formatDateKey(year, month, day) {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

function DaysGrid({ year, month, chores, completed, onToggleChore }) {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(<div key={`empty-${i}`} className="empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDateKey(year, month, day);
        const dayChores = chores[dateKey] || [];

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        cells.push(
            <div key={day} className={`day ${isToday ? "today" : ""}`}>
                <div className="day-number">{day}</div>
                <ul className="chore-list">
                    {dayChores.map((chore, idx) => {
                        const choreId = `${dateKey}-${idx}`;
                        const isDone = completed[choreId] || false;
                        return (
                            <li key={choreId} className="chore-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isDone}
                                        onChange={() => onToggleChore(choreId)}
                                    />
                                    <span className={isDone ? "chore-done" : ""}>
                                        {chore}
                                    </span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return <div className="days-grid">{cells}</div>;
}

export default function CalendarChoreMo() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [completed, setCompleted] = useState({});

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const toggleChore = (choreId) => {
        setCompleted((prev) => ({
            ...prev,
            [choreId]: !prev[choreId],
        }));
    };

    return (
        <div className="calendar">
            <div className="header">
                <button onClick={prevMonth}>◀</button>
                <h2>
                    {MONTH_NAMES[month]} {year}
                </h2>
                <button onClick={nextMonth}>▶</button>
            </div>

            <div className="weekdays">
                {WEEKDAYS.map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <DaysGrid
                year={year}
                month={month}
                chores={SAMPLE_CHORES}
                completed={completed}
                onToggleChore={toggleChore}
            />
        </div>
    );
}