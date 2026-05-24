import "./Calendar.css";
import Button from "../../components/Button";
import CalendarAvailMo from "../../components/CalendarAvailMo";

import { useState } from "react";

export default function Calendar() {
    const now = new Date();
    const monthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const [activeView, setActiveView] = useState('Month');

    const statuses = [
        { label: 'Available', description: 'Knock anytime',         color: '#86c98e' },
        { label: 'Busy',      description: 'In a class or meeting', color: '#f0958a' },
        { label: 'Private',   description: "Don't disturb me",      color: '#8E3251;' },
    ];

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
                            onClick={() => setActiveView(label)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="hstack">
                <CalendarAvailMo activeView={activeView} />

                <div className="vstack">
                    <div className="status-panel">
                        <h2 className="status-panel-title">Set my status</h2>
                        <p className="status-panel-subtitle">Tap below to enable click-to-edit on the calendar.</p>
                        <Button label="Edit My Status" className="edit-status-btn" />
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