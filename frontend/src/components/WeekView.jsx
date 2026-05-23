import ChoreCard from "./ChoreCard";
import "./WeekView.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WeekView({chores = {}, onToggle}) {
    return (
        <div className="week-view">
            {DAYS.map((day) => (
                <div key={day} className="day-column">
                    <h3>{day}</h3>

                {(chores[day] || []).map((chore, i) => (
                    <ChoreCard
                        key={i}
                        assignee={chore.assignee}
                        description={chore.description}
                        timeOfDay={chore.timeOfDay}
                        checked={chore.checked}
                        onToggle={() => onToggle(day, i)}
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