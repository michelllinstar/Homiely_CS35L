import { useState, useEffect } from 'react';
import './CalendarAvailMo.css';

const USERS = [
    { id: 1, name: 'Emma',   initials: 'EC', avatarColor: '#a8d5a8' },
    { id: 2, name: 'Jerry',  initials: 'JH', avatarColor: '#8ab4d6' },
    { id: 3, name: 'Thomas', initials: 'TL', avatarColor: '#f0a89e' },
    { id: 4, name: 'You',    initials: 'ML', avatarColor: '#f4c542', isMe: true },
];

const DAY_NAMES  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_TIMES = ['8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p'];
const DAY_TIMES  = ['8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p'];

const HOUR_MAP = {
    '8a': 8, '9a': 9, '10a': 10, '11a': 11, '12p': 12,
    '1p': 13, '2p': 14, '3p': 15, '4p': 16, '5p': 17,
    '6p': 18, '7p': 19, '8p': 20, '9p': 21, '10p': 22,
};

const STATUS_CYCLE = ['available', 'busy', 'private'];

function getStatus(userId, dayIndex, timeIndex) {
    const seed = (userId * 31 + dayIndex * 17 + timeIndex * 13 + 7) % 10;
    if (seed < 6) return 'available';
    if (seed < 9) return 'busy';
    return 'private';
}

function dateForDayIndex(dayIndex) {
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;
    const diff = dayIndex - currentDay;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.toISOString().slice(0, 10);
}

export default function CalendarAvailMo({ activeView = 'Month', editMode = false, confirmRef = null }) {
    if (activeView === 'Day')  return <DayView editMode={editMode} confirmRef={confirmRef} />;
    if (activeView === 'Week') return <WeekView />;
    return <MonthView />;
}

/* ---------- MONTH ---------- */
function MonthView() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="cam cam-month">
            <div className="cam-month-header">
                {DAY_NAMES.map(d => (
                    <div key={d} className="cam-month-day-label">{d.toUpperCase()}</div>
                ))}
            </div>
            <div className="cam-month-grid">
                {cells.map((date, i) => {
                    if (date === null) {
                        return <div key={i} className="cam-month-cell cam-month-cell-empty" />;
                    }
                    const counts = { available: 0, busy: 0, private: 0 };
                    USERS.forEach(u => { counts[getStatus(u.id, (date - 1) % 7, 4)]++; });
                    const dominant =
                        counts.available >= counts.busy && counts.available >= counts.private ? 'available'
                        : counts.busy >= counts.private ? 'busy' : 'private';

                    return (
                        <div
                            key={i}
                            className={`cam-month-cell cam-month-cell-${dominant} ${date === today ? 'cam-month-cell-today' : ''}`}
                        >
                            <div className="cam-month-date">{date}</div>
                            <div className="cam-month-summary">
                                {USERS.map(u => {
                                    const s = getStatus(u.id, (date - 1) % 7, 4);
                                    return (
                                        <span
                                            key={u.id}
                                            className={`cam-month-dot cam-month-dot-${s} ${u.isMe ? 'cam-month-dot-me' : ''}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- WEEK ---------- */
function WeekView() {
    return (
        <div className="cam cam-week">
            <div className="cam-week-header">
                <div className="cam-week-corner" />
                {DAY_NAMES.map(d => (
                    <div key={d} className="cam-week-day-label">{d.toUpperCase()}</div>
                ))}
            </div>
            <div className="cam-week-body">
                {WEEK_TIMES.map((t, ti) => (
                    <div key={t} className="cam-week-row">
                        <div className="cam-week-time-label">{t}</div>
                        {DAY_NAMES.map((d, di) => (
                            <div key={d} className="cam-week-cell">
                                {USERS.map(u => {
                                    const s = getStatus(u.id, di, ti);
                                    return (
                                        <div
                                            key={u.id}
                                            className={`cam-week-pill cam-week-pill-${s} ${u.isMe ? 'cam-week-pill-me' : ''}`}
                                            title={`${u.name}: ${s}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- DAY ---------- */
function DayView({ editMode, confirmRef }) {
    const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);
    const [allAvailability, setAllAvailability] = useState({});   // { dateStr: [...] }
    const [myAvailability, setMyAvailability] = useState({});     // { dateStr: { hour: status } }
    const [pendingChanges, setPendingChanges] = useState({});     // { dateStr: { hour: status } }

    const token = localStorage.getItem('access_token');
    const dateStr = dateForDayIndex(selectedDay);

    // Fetch all users' availability for selected day (only if not already fetched)
    useEffect(() => {
        if (allAvailability[dateStr] !== undefined) return;
        fetch(`/api/availability/?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setAllAvailability(prev => ({
                ...prev,
                [dateStr]: Array.isArray(data) ? data : []
            })))
            .catch(() => setAllAvailability(prev => ({ ...prev, [dateStr]: [] })));
    }, [selectedDay, dateStr, token]);

    // Fetch current user's saved availability for selected day (only if not already fetched)
    useEffect(() => {
        if (myAvailability[dateStr] !== undefined) return;
        fetch(`/api/availability/me?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const map = {};
                if (Array.isArray(data)) {
                    data.forEach(row => { map[row.hour] = row.status; });
                }
                setMyAvailability(prev => ({ ...prev, [dateStr]: map }));
            })
            .catch(() => setMyAvailability(prev => ({ ...prev, [dateStr]: {} })));
    }, [selectedDay, dateStr, token]);

    // Register flush function — writes all pending changes across all days
    useEffect(() => {
        if (!confirmRef) return;
        confirmRef.current = async () => {
            const writes = [];
            Object.entries(pendingChanges).forEach(([date, hours]) => {
                Object.entries(hours).forEach(([hour, status]) => {
                    writes.push(
                        fetch('/api/availability/me', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ date, hour: parseInt(hour), status }),
                        })
                    );
                });
            });
            await Promise.all(writes);

            // Merge all pending into saved state
            setMyAvailability(prev => {
                const next = { ...prev };
                Object.entries(pendingChanges).forEach(([date, hours]) => {
                    next[date] = { ...(next[date] || {}), ...hours };
                });
                return next;
            });
            setPendingChanges({});
        };
    }, [pendingChanges, token, confirmRef]);

    const handleCellClick = (hour) => {
        if (!editMode) return;
        const current =
            pendingChanges[dateStr]?.[hour] ??
            myAvailability[dateStr]?.[hour] ??
            'available';
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
        setPendingChanges(prev => ({
            ...prev,
            [dateStr]: { ...(prev[dateStr] || {}), [hour]: next }
        }));
    };

    const getMyStatus = (hour) =>
        pendingChanges[dateStr]?.[hour] ??
        myAvailability[dateStr]?.[hour] ??
        'available';

    const getStatusForUser = (userId, hour, isMe) => {
        if (isMe) return getMyStatus(hour);
        const rows = allAvailability[dateStr] || [];
        const row = rows.find(r => r.user_id === userId && r.hour === hour);
        return row ? row.status : 'available';
    };

    const statusLabel = (s) =>
        s === 'available' ? 'Available' : s === 'busy' ? 'Busy' : 'Private';

    const totalPending = Object.values(pendingChanges)
        .reduce((sum, hours) => sum + Object.keys(hours).length, 0);

    return (
        <div className="cam cam-day">
            <div className="cam-day-selector">
                {DAY_NAMES.map((d, i) => (
                    <button
                        key={d}
                        className={`cam-day-tab ${i === selectedDay ? 'active' : ''}`}
                        onClick={() => setSelectedDay(i)}
                    >
                        {d}
                    </button>
                ))}
            </div>
            {editMode && (
                <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                    Click your row to cycle status.{totalPending > 0 ? ` ${totalPending} unsaved change(s) across all days.` : ''}
                </p>
            )}
            <div className="cam-day-body">
                {DAY_TIMES.map((t) => {
                    const hour = HOUR_MAP[t];
                    return (
                        <div key={t} className="cam-day-row">
                            <div className="cam-day-time-label">{t}</div>
                            {USERS.map(u => {
                                const s = getStatusForUser(u.id, hour, u.isMe);
                                const isPending = u.isMe && pendingChanges[dateStr]?.[hour] !== undefined;
                                return (
                                    <div
                                        key={u.id}
                                        className={`cam-day-cell cam-day-cell-${s} ${u.isMe ? 'cam-day-cell-me' : ''} ${u.isMe && editMode ? 'cam-day-cell-editable' : ''} ${isPending ? 'cam-day-cell-pending' : ''}`}
                                        onClick={() => u.isMe && handleCellClick(hour)}
                                    >
                                        <span className="cam-day-avatar" style={{ background: u.avatarColor }}>
                                            {u.initials}
                                        </span>
                                        <div className="cam-day-cell-text">
                                            <div className="cam-day-cell-name">
                                                {u.name}{u.isMe ? ' (you)' : ''}
                                            </div>
                                            <div className="cam-day-cell-status">{statusLabel(s)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}