import { useState, useEffect, useCallback } from 'react';
import './CalendarAvailMo.css';

const AVATAR_COLORS = ['#a8d5a8','#8ab4d6','#f0a89e','#f4c542','#c9a8f0','#f0d08a'];

function buildUsers(members, currentUserId) {
    return members.map((m, i) => ({
        id: m.id,
        name: m.id === currentUserId ? 'You' : m.name,
        initials: m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        isMe: m.id === currentUserId,
    }));
}

const DAY_NAMES  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_TIMES = [
    '8a','9a','10a','11a',
    '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p',
    '12a','1a','2a','3a','4a','5a','6a','7a',
];

const DAY_TIMES = [
    '8a','9a','10a','11a',
    '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p',
    '12a','1a','2a','3a','4a','5a','6a','7a',
];

const HOUR_MAP = {
    '12a': 0, '1a': 1,  '2a': 2,  '3a': 3,  '4a': 4,  '5a': 5,
    '6a': 6,  '7a': 7,  '8a': 8,  '9a': 9,  '10a': 10, '11a': 11,
    '12p': 12,'1p': 13, '2p': 14, '3p': 15, '4p': 16, '5p': 17,
    '6p': 18, '7p': 19, '8p': 20, '9p': 21, '10p': 22, '11p': 23,
};

const STATUS_CYCLE = ['available', 'busy', 'private'];

function isSleepHour(hour, sleepRef) {
    const schedule = sleepRef?.current;
    if (!schedule) {
        return hour >= 0 && hour <= 6;
    }
    const { start, end } = schedule;
    if (start <= end) {
        return hour >= start && hour < end;
    }
    // overnight wraparound e.g. 22 -> 7
    return hour >= start || hour < end;
}

function defaultStatus(hour, sleepRef, isMe) {
    if (isMe && isSleepHour(hour, sleepRef)) return 'private';
    return 'available';
}

function dateForDayIndex(dayIndex) {
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;
    const diff = dayIndex - currentDay;
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.toISOString().slice(0, 10);
}

export default function CalendarAvailMo({ activeView = 'Month', editMode = false, confirmRef = null, sleepRef = null, refreshRef = null }) {
    const [myAvailability, setMyAvailability] = useState({});
    const [pendingChanges, setPendingChanges] = useState({});
    const [users, setUsers] = useState([]);
    const [groupAvailability, setGroupAvailability] = useState({});

    const token = localStorage.getItem('access_token');

    const fetchDate = useCallback((dateStr) => {
        if (!token) return;
        fetch(`/api/availability/?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setGroupAvailability(prev => ({
                ...prev,
                [dateStr]: Array.isArray(data) ? data : []
            })))
            .catch(() => setGroupAvailability(prev => ({ ...prev, [dateStr]: [] })));
    }, [token]);

    const fetchWeek = useCallback(() => {
        if (!token) return;
        const fetches = Array.from({ length: 7 }, (_, i) => {
            const dateStr = dateForDayIndex(i);
            return fetch(`/api/availability/?date=${dateStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => ({ dateStr, data: Array.isArray(data) ? data : [] }))
                .catch(() => ({ dateStr, data: [] }));
        });
        Promise.all(fetches).then(results => {
            const map = {};
            results.forEach(({ dateStr, data }) => { map[dateStr] = data; });
            setGroupAvailability(prev => ({ ...prev, ...map }));
        });
    }, [token]);

    useEffect(() => {
        if (!token) return;
        const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
        fetch('/api/groups/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (!data.has_roommate_group) return;
                return fetch(`/api/groups/${data.group.id}/members`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            })
            .then(r => r && r.json())
            .then(data => {
                if (!data) return;
                setUsers(buildUsers(Array.isArray(data) ? data : [], currentUserId));
            })
            .catch(() => setUsers([]));
    }, [token]);

    useEffect(() => {
        fetchWeek();
        if (refreshRef) refreshRef.current = fetchWeek;
    }, [fetchWeek, refreshRef]);

    if (activeView === 'Day') return (
        <DayView
            editMode={editMode}
            confirmRef={confirmRef}
            myAvailability={myAvailability}
            setMyAvailability={setMyAvailability}
            pendingChanges={pendingChanges}
            setPendingChanges={setPendingChanges}
            users={users}
            groupAvailability={groupAvailability}
            fetchDate={fetchDate}
            onSaved={fetchWeek}
            sleepRef={sleepRef}
        />
    );
    if (activeView === 'Week') return (
        <WeekView users={users} groupAvailability={groupAvailability} sleepRef={sleepRef} />
    );
    return (
        <MonthView users={users} groupAvailability={groupAvailability} sleepRef={sleepRef} />
    );
}

/* ---------- MONTH ---------- */
function MonthView({ users, groupAvailability, sleepRef }) {
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
                    const dateStr = new Date(year, month, date).toISOString().slice(0, 10);
                    const rows = groupAvailability[dateStr] || [];

                    const counts = { available: 0, busy: 0, private: 0 };
                    users.forEach(u => {
                        const row = rows.find(r => r.user_id === u.id && r.hour === 12);
                        const s = row ? row.status : defaultStatus(12, sleepRef, u.isMe);
                        counts[s]++;
                    });

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
                                {users.map(u => {
                                    const row = rows.find(r => r.user_id === u.id && r.hour === 12);
                                    const s = row ? row.status : defaultStatus(12, sleepRef, u.isMe);
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
function WeekView({ users, groupAvailability, sleepRef }) {
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
                        {DAY_NAMES.map((d, di) => {
                            const dateStr = dateForDayIndex(di);
                            const rows = groupAvailability[dateStr] || [];
                            return (
                                <div key={d} className="cam-week-cell">
                                    {users.map(u => {
                                        const hour = HOUR_MAP[t];
                                        const row = rows.find(r => r.user_id === u.id && r.hour === hour);
                                        const s = row ? row.status : defaultStatus(hour, sleepRef, u.isMe);
                                        return (
                                            <div
                                                key={u.id}
                                                className={`cam-week-pill cam-week-pill-${s} ${u.isMe ? 'cam-week-pill-me' : ''}`}
                                                title={`${u.name}: ${s}`}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- DAY ---------- */
function DayView({
    editMode, confirmRef,
    myAvailability, setMyAvailability,
    pendingChanges, setPendingChanges,
    users, groupAvailability, fetchDate, onSaved, sleepRef,
}) {
    const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);

    const token = localStorage.getItem('access_token');
    const dateStr = dateForDayIndex(selectedDay);

    useEffect(() => {
        if (groupAvailability[dateStr] !== undefined) return;
        fetchDate(dateStr);
    }, [selectedDay, dateStr, groupAvailability, fetchDate]);

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
            setMyAvailability(prev => {
                const next = { ...prev };
                Object.entries(pendingChanges).forEach(([date, hours]) => {
                    next[date] = { ...(next[date] || {}), ...hours };
                });
                return next;
            });
            setPendingChanges({});
            if (onSaved) onSaved();
        };
    }, [pendingChanges, token, confirmRef, onSaved]);

    const handleCellClick = (hour) => {
        if (!editMode) return;
        const current =
            pendingChanges[dateStr]?.[hour] ??
            myAvailability[dateStr]?.[hour] ??
            defaultStatus(hour, sleepRef, true);
        const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
        setPendingChanges(prev => ({
            ...prev,
            [dateStr]: { ...(prev[dateStr] || {}), [hour]: next }
        }));
    };

    const getMyStatus = (hour) =>
        pendingChanges[dateStr]?.[hour] ??
        myAvailability[dateStr]?.[hour] ??
        defaultStatus(hour, sleepRef, true);

    const getStatusForUser = (userId, hour, isMe) => {
        if (isMe) return getMyStatus(hour);
        const rows = groupAvailability[dateStr] || [];
        const row = rows.find(r => r.user_id === userId && r.hour === hour);
        return row ? row.status : defaultStatus(hour, sleepRef, false);
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
                        <div
                            key={t}
                            className="cam-day-row"
                            style={{ gridTemplateColumns: `48px repeat(${users.length}, 1fr)` }}
                        >
                            <div className="cam-day-time-label">{t}</div>
                            {users.map(u => {
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