import ChoreCard from "./ChoreCard";
import "./YourWeek.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function YourWeek({ chores = {}, currentUser, onToggle, onDelete }) {
    // Filter down to only days that have chores assigned to the current user
    const myChores = {};
    DAYS.forEach((day) => {
        const filtered = (chores[day] || []).filter(
            (chore) => chore.assignee === currentUser
        );
        if (filtered.length > 0) myChores[day] = filtered;
    });

    // Calculate total and completed
    const allMyChores = Object.values(myChores).flat();
    const total = allMyChores.length;
    const completed = allMyChores.filter((chore) => chore.checked).length;
    const remaining = total - completed;

    return (
        <div>
            <h2>Your Week</h2>
            <p>{remaining} chores remaining — {completed} of {total} complete</p>

        <div className="your-week-days">
                {Object.entries(myChores).map(([day, dayChores]) => (
                    <div key={day}>
                        <h3>{day}</h3>
                        {dayChores.map((chore) => {
                            // Find this chore's real index in the full day array
                            const realIndex = chores[day].indexOf(chore);
                            return (
                                // [GenAI Use] Refer to ChoreCard.css for prompt and reflection.
                                <ChoreCard
                                    key={realIndex}
                                    assignee={chore.assignee}
                                    description={chore.description}
                                    timeOfDay={chore.timeOfDay}
                                    checked={chore.checked}
                                    day={day}
                                    onToggle={() => onToggle(day, realIndex)}
                                    onDelete={() => onDelete(day, realIndex, chore.id)}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}