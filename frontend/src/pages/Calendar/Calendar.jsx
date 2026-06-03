import "./Calendar.css";
import Button from "../../components/Button";
import CalendarAvailMo from "../../components/CalendarAvailMo";
import { useState, useRef } from "react";

export default function Calendar() {
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const [activeView, setActiveView] = useState('Month');
    const [editMode, setEditMode] = useState(false);
    const confirmRef = useRef(null); // DayView will register its confirm function here

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
            await confirmRef.current();  // flush pending changes to backend
        }
        setEditMode(false);
    };

    return (
        <div className="calendar-page">
            <div className="vstack">
                <h1 className="calendar-title">Availability</h1>
                <p className="calendar-subtitle">Shared schedule · {monthYear}</p>
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

                <div className="hstack">
                    <CalendarAvailMo
                        activeView={activeView}
                        editMode={editMode}
                        confirmRef={confirmRef}
                    />

                    <div className="vstack">
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
                        <Button label="Connect to Google Calendar" />
                    </div>
                </div>
            </div>
        </div>
    );
}