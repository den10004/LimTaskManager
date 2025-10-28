import { useEffect, useState } from "react";
import { getCookie } from "../../utils/getCookies";
import {
  API_URL,
  ASSIGNED,
  COMPLETED,
  OVERDUE,
  WORK,
  statusColors,
} from "../../utils/rolesTranslations";
import "./style.css";

const statusColorMap = {
  ...statusColors,
  [ASSIGNED]: "orange",
};

function MainPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status) => {
    return statusColorMap[status] || "";
  };

  const loadEvents = async () => {
    const token = getCookie("authTokenPM");
    if (!token) {
      setLoading(false);
      throw new Error("Токен авторизации отсутствует");
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/task`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      const eventsByDate = {};
      const activeTasks = data.items.filter(
        (task) => task.status !== COMPLETED
      );

      activeTasks.forEach((event) => {
        if (event.created_at) {
          const startDate = new Date(event.created_at);
          const endDate = event.due_at
            ? new Date(event.due_at)
            : new Date(event.created_at);

          if (endDate < startDate) {
            endDate.setDate(startDate.getDate());
          }
          endDate.setHours(23, 59, 59, 999);
          const currentDay = new Date(startDate);
          currentDay.setHours(0, 0, 0, 0);
          while (currentDay <= endDate) {
            const dateKey = currentDay.toDateString();

            if (!eventsByDate[dateKey]) {
              eventsByDate[dateKey] = [];
            }

            eventsByDate[dateKey].push({
              id: event.id || Date.now(),
              description: event.title || "Нет заголовка",
              createdAt: event.created_at,
              dueAt: event.due_at,
              date: new Date(currentDay),
              isStartDay: currentDay.getTime() === startDate.getTime(),
              isEndDay: currentDay.getTime() === endDate.getTime(),
              isMultiDay: startDate.getTime() !== endDate.getTime(),
              status: event.status,
              directionId: event.direction_id,
              color: getStatusColor(event.status),
            });

            currentDay.setDate(currentDay.getDate() + 1);
          }
        }
      });

      setEvents(eventsByDate);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventClassName = (event) => {
    let className = "event";
    if (event.isMultiDay) {
      if (event.isStartDay) {
        className += " event-start";
      } else if (event.isEndDay) {
        className += " event-end";
      } else {
        className += " event-middle";
      }
    }
    return className;
  };

  const getEventTitle = (event) => {
    let title = "";
    if (event.isStartDay) {
      title += `Начало: ${formatEventTime(event.createdAt)}\n`;
    }
    if (event.isEndDay && event.dueAt) {
      title += `Окончание: ${formatEventTime(event.dueAt)}\n`;
    }
    title += event.description;
    return title;
  };

  const renderDay = (date, isOtherMonth = false) => {
    const dateKey = date.toDateString();
    const dayEvents = events[dateKey] || [];
    const dayClass = `calendar-day ${isToday(date) ? "today" : ""} ${
      isOtherMonth ? "other-month" : ""
    }`;
    console.log(dayEvents);
    return (
      <div key={dateKey} className={dayClass}>
        <div className="day-number">{date.getDate()}</div>
        <div className="events">
          {dayEvents.map((event) => (
            <a
              key={`${event.id}-${event.date.getTime()}`}
              className={getEventClassName(event)}
              title={getEventTitle(event)}
              href={`/tasks/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
                backgroundColor:
                  event.status === OVERDUE
                    ? "var(--color-err)"
                    : event.status === ASSIGNED
                    ? "orange"
                    : event.status === WORK
                    ? "var(--color-green)"
                    : "black",
              }}
            >
              {event.isStartDay && (
                <span className="event-time">
                  {formatEventTime(event.createdAt)}
                </span>
              )}
              <span className="event-description">
                {event.description.length > 15
                  ? `${event.description.substring(0, 15)}...`
                  : event.description}
              </span>
              {event.isEndDay && event.dueAt && (
                <span className="event-time-end">
                  {formatEventTime(event.dueAt)}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const days = [];
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = getDaysInMonth(currentDate);

    // Previous month days
    if (offset > 0) {
      const prevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      );
      const daysInPrevMonth = getDaysInMonth(prevMonth);
      for (let i = daysInPrevMonth - offset + 1; i <= daysInPrevMonth; i++) {
        const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i);
        days.push(renderDay(date, true));
      }
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      days.push(renderDay(date));
    }

    // Next month days
    const totalDaysSoFar = offset + daysInMonth;
    const remaining = (7 - (totalDaysSoFar % 7)) % 7;
    if (remaining > 0) {
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
        days.push(renderDay(date, true));
      }
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return <div className="loading">Загрузка событий...</div>;
  }

  return (
    <section className="container">
      <h3 className="h3-mtmb">Календарь</h3>
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)} className="nav-button">
          ←
        </button>
        <h2>{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="nav-button">
          →
        </button>
      </div>

      <div className="calendar-grid">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </section>
  );
}

export default MainPage;
