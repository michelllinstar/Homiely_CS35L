// [GenAI Use] Prompt: "Rename the Calendar page to Availability and show the shared EmptyState prompting the user to create/join a roommate group when they have none."
// [GenAI Use] Reflection: The response was good and notably careful about hook ordering. It kept the hooks above the early return so the new group guard doesn't violate rules-of-hooks, a common mistake. I verified the rename is complete and that the guard renders before the availability grid. No fixes needed beyond confirming the hook placement.

import "./Availability.css";
import Button from "../../components/Button";
import CalendarAvailMo from "../../components/CalendarAvailMo";
import { useState, useRef } from "react";
import AppNavbar from "../../components/Home_components/AppNavbar";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../AuthContext";

function dateForDayIndex(dayIndex) {
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;
    const diff = dayIndex - currentDay;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.toISOString().slice(0, 10);
}

export default function Availability() {
    const { user } = useAuth();
    const groupId = user?.roommate_group_id;

    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const [activeView, setActiveView] = useState('Day');
    const [editMode, setEditMode] = useState(false);
    const [sleepStart, setSleepStart] = useState('0');
    const [sleepEnd, setSleepEnd] = useState('7');
    const [sleepSaved, setSleepSaved] = useState(false);
    const confirmRef = useRef(null);
    const sleepRef = useRef(null);
    const refreshRef = useRef(null); // CalendarAvailMo registers fetchWeek here

    const statuses = [
        { label: 'Available', description: 'Knock anytime',         color: '#86c98e' },
        { label: 'Busy',      description: 'In a class or meeting', color: '#f0958a' },
        { label: 'Private',   description: "Don't disturb me",      color: '#8E3251' },
    ];

    const handleEditMyStatus = () => {
        setActiveView('Day');
        setEditMode(true);
    };

    const handleConfirm = async () => {
        if (confirmRef.current) {
            await confirmRef.current();
        }
        setEditMode(false);
    };

    // Returns the list of hours covered by a sleep schedule, handling overnight wraparound.
    const sleepHoursBetween = (start, end) => {
        const hours = [];
        if (start <= end) {
            for (let h = start; h < end; h++) hours.push(h);
        } else {
            for (let h = start; h < 24; h++) hours.push(h);
            for (let h = 0; h < end; h++) hours.push(h);
        }
        return hours;
    };

    const handleSaveSleep = async () => {
        const start = parseInt(sleepStart);
        const end = parseInt(sleepEnd);

        // Capture the previously-saved schedule before overwriting it so we can
        // clear hours that used to be sleep but no longer are.
        const prev = sleepRef.current;
        sleepRef.current = { start, end };

        const token = localStorage.getItem('access_token');

        const sleepHours = sleepHoursBetween(start, end);

        // Hours that were sleep under the previous schedule but aren't anymore —
        // reset these back to available so the old schedule doesn't linger.
        const clearedHours = prev
            ? sleepHoursBetween(prev.start, prev.end).filter(h => !sleepHours.includes(h))
            : [];

        const postStatus = (dateStr, hour, status) =>
            fetch('/api/availability/me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date: dateStr, hour, status }),
            });

        // Write private for each new sleep hour and available for each cleared
        // hour, for every day this week.
        // POST /api/availability/me only writes for the JWT identity —
        // the backend enforces that no other user's data can be modified
        const writes = [];
        for (let i = 0; i < 7; i++) {
            const dateStr = dateForDayIndex(i);
            sleepHours.forEach(hour => writes.push(postStatus(dateStr, hour, 'private')));
            clearedHours.forEach(hour => writes.push(postStatus(dateStr, hour, 'available')));
        }

        await Promise.all(writes);

        // Re-fetch group availability so all views update immediately
        if (refreshRef.current) refreshRef.current();

        setSleepSaved(true);
        setTimeout(() => setSleepSaved(false), 2000);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formatHour = (h) => {
        if (h === 0) return '12 AM';
        if (h === 12) return '12 PM';
        return h < 12 ? `${h} AM` : `${h - 12} PM`;
    };

    // [GenAI Use] Generated code start
    // A shared availability calendar only makes sense within a roommate group.
    // If the user has not joined one yet, prompt them to set one up.
    if (!groupId) {
        return (
            <div className="availability-page">
                <AppNavbar />
                <EmptyState
                    title="Availability"
                    message="You need to create or join a roommate group before sharing a calendar."
                    actionLabel="Set up roommate group"
                    actionTo="/group-setup"
                />
            </div>
        );
    }
    // [GenAI Use] Generated code end

    return (
        <div className="availability-page">
            <AppNavbar />
            <div className="vstack">
                <h1 className="availability-title">Availability</h1>
                <p className="availability-subtitle">Shared schedule · {monthYear}</p>
            </div>

            <div className="vstack">
                <div className="hstack">
                    <div className="toggleview">
                        {['Day', 'Week', 'Month'].map((label) => (
                            <button
                                key={label}
                                className={`toggleview-btn ${activeView === label ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveView(label);
                                    if (label !== 'Day') setEditMode(false);
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hstack" style={{ alignItems: 'flex-start' }}>
                    <div className="vstack" style={{ alignSelf: 'flex-start' }}>
                        <div className="status-panel">
                            <h2 className="status-panel-title">Set my status</h2>
                            <p className="status-panel-subtitle">Tap below to enable click-to-edit on the calendar.</p>
                            {editMode ? (
                                <Button
                                    label="Confirm Changes"
                                    className="edit-status-btn"
                                    onClick={handleConfirm}
                                />
                            ) : (
                                <Button
                                    label="Edit My Status"
                                    className="edit-status-btn"
                                    onClick={handleEditMyStatus}
                                />
                            )}
                            <p className="status-types-label">Status Types</p>
                            <div className="status-list">
                                {statuses.map(s => (
                                    <div key={s.label} className="status-item">
                                        <span className="status-dot" style={{ background: s.color }} />
                                        <div className="vstack" style={{ gap: 2 }}>
                                            <p className="status-item-title">{s.label}</p>
                                            <p className="status-item-desc">{s.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="status-panel">
                            <h2 className="status-panel-title">Sleep schedule</h2>
                            <p className="status-panel-subtitle">Hours marked private automatically.</p>
                            <div className="sleep-row">
                                <div className="sleep-field">
                                    <label className="sleep-label">Bedtime</label>
                                    <select
                                        className="sleep-select"
                                        value={sleepStart}
                                        onChange={e => setSleepStart(e.target.value)}
                                    >
                                        {hours.map(h => (
                                            <option key={h} value={h}>{formatHour(h)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sleep-field">
                                    <label className="sleep-label">Wake up</label>
                                    <select
                                        className="sleep-select"
                                        value={sleepEnd}
                                        onChange={e => setSleepEnd(e.target.value)}
                                    >
                                        {hours.map(h => (
                                            <option key={h} value={h}>{formatHour(h)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button className="sleep-save-btn" onClick={handleSaveSleep}>
                                {sleepSaved ? 'Saved ✓' : 'Apply to calendar'}
                            </button>
                        </div>
                    </div>

                    <CalendarAvailMo
                        activeView={activeView}
                        editMode={editMode}
                        confirmRef={confirmRef}
                        sleepRef={sleepRef}
                        refreshRef={refreshRef}
                    />
                </div>
            </div>
        </div>
    );
}