import React, { useMemo, useState } from "react";
import "./Calendar.css";

export default function CalendarAvailMo({
  roommates = [],
  maxRoommates = 10,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const visibleRoommates = roommates.slice(0, maxRoommates);

  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells before month start
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDateKey = (day) => {
    const date = new Date(year, month, day);

    return date.toISOString().split("T")[0];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#22c55e"; // green

      case "busy":
        return "#ef4444"; // red

      case "away":
        return "#f59e0b"; // yellow

      default:
        return "#9ca3af"; // gray
    }
  };

  return (
    <div className="calendar-wrapper">
      {/* HEADER */}
      <div className="calendar-header">
        <button onClick={prevMonth}>◀</button>

        <h2>
          {monthName} {year}
        </h2>

        <button onClick={nextMonth}>▶</button>
      </div>

      {/* WEEKDAYS */}
      <div className="weekday-row">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div className="weekday" key={day}>
            {day}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div className="empty-cell" key={index}></div>;
          }

          const dateKey = getDateKey(day);

          return (
            <div className="calendar-cell" key={day}>
              <div className="date-number">{day}</div>

              <div className="roommate-list">
                {visibleRoommates.map((roommate) => {
                  const status =
                    roommate.availability?.[dateKey] || "unknown";

                  return (
                    <div
                      key={roommate.id}
                      className="roommate-status"
                      style={{
                        backgroundColor: getStatusColor(status),
                      }}
                    >
                      <span className="roommate-name">
                        {roommate.name}
                      </span>

                      <span className="status-text">
                        {status}
                      </span>
                    </div>
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