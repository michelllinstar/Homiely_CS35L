import ChoreCard from "./ChoreCard";
import "./WeekView.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function YourWeek({ chores = {}, currentUser, onToggle, onDelete }) {
    return (
        <div className="week-view">
            {DAYS.map((day) => (
                <div key={day} className="day-column">
                    <h3>{day}</h3>

                {(chores[day] || []).map((chore, i) => (
                    // [GenAI Use] Refer to ChoreCard.css for prompt and reflection.
                    <ChoreCard
                        key={i}
                        assignee={chore.assignee}
                        description={chore.description}
                        timeOfDay={chore.timeOfDay}
                        checked={chore.checked}
                        day={day}
                        onToggle={() => onToggle(day, i)}
                        onDelete={() => onDelete(day, i, chore.id)}
                    />
                ))}

                {(!chores[day] || chores[day].length === 0) && (
                    <p className="no-chores">No chores</p>
                )}
                </div>
            ))}
        </div>
    );
}