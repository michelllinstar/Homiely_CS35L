import Button from "./Button";
import "./EmptyState.css";


export default function EmptyState({ title, message, actionLabel, actionTo }) {
    return (
        <div className="empty-state">
            <h1 className="empty-state-title">{title}</h1>
            <p className="empty-state-message">{message}</p>
            {actionLabel && <Button to={actionTo} label={actionLabel} />}
        </div>
    );
}

