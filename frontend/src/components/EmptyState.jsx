import Button from "./Button";
import "./EmptyState.css";

// Centered, full-height prompt shown when a page has nothing to display yet —
// for example when the user hasn't joined a roommate group. Keeping this in one
// place means Availability, Chores, and Expenses all share the exact same empty-state
// look instead of each page styling its own headings and copy.
export default function EmptyState({ title, message, actionLabel, actionTo }) {
    return (
        <div className="empty-state">
            <h1 className="empty-state-title">{title}</h1>
            <p className="empty-state-message">{message}</p>
            {actionLabel && <Button to={actionTo} label={actionLabel} />}
        </div>
    );
}
