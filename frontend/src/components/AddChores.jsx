import { useState } from "react";
import "./AddChores.css";
import Button from "./Button";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateTimes() {
    const times = ["Due anytime"];
    for (let hour = 7; hour <= 23; hour++) {
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour <= 12 ? hour : hour - 12;
        times.push(`Due ${displayHour}:00 ${period}`);
        if (hour < 23) times.push(`Due ${displayHour}:30 ${period}`);
    }
    return times;
}

const TIMES = generateTimes();

export default function AddChores({ onAddChore, roommates = [] }) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [assignee, setAssignee] = useState("");
    const [day, setDay] = useState("Sunday");
    const [timeOfDay, setTimeOfDay] = useState("Due anytime");

    function handleSubmit() {
        if (!description || !assignee) return;
        onAddChore({ description, assignee, day, timeOfDay, checked: false });
        // Reset form
        setDescription("");
        setAssignee("");
        setDay("Sunday");
        setTimeOfDay("Due anytime");
        setOpen(false);
    }

    return (
        <div>
            <Button label="Add Chore" onClick={() => setOpen(!open)} />

            {/* [GenAI Use] Refer to AddChores.css for prompt and reflection. */}
            {open && (
                <div className="add-chores-form">
                    <h3>Add a new chore</h3>

                    <div className="add-chores-field">
                        <label>Chore</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Vacuum living room"
                        />
                    </div>

                    {/* Roommate dropdown */}
                    <div className="add-chores-field">
                        <label>Assign to</label>
                        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                            <option value="">Select a roommate</option>
                            {roommates.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Day dropdown */}
                    <div className="add-chores-field">
                        <label>Day</label>
                        <select value={day} onChange={(e) => setDay(e.target.value)}>
                            {DAYS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time dropdown */}
                    <div className="add-chores-field">
                        <label>Time</label>
                        <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
                            {TIMES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="add-chores-buttons">
                        <Button label="Add" onClick={handleSubmit} />
                        <Button label="Cancel" onClick={() => setOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}