import { useEffect, useState } from "react";
import { getCookie } from "../../utils/getCookies";
import "./style.css";

function MainPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const API_URL = import.meta.env.VITE_API_KEY;
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
        (task) => task.status !== "Задача выполнена"
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
              description: event.description || "No description",
              createdAt: event.created_at,
              dueAt: event.due_at,
              date: new Date(currentDay),
              isStartDay: currentDay.getTime() === startDate.getTime(),
              isEndDay: currentDay.getTime() === endDate.getTime(),
              isMultiDay: startDate.getTime() !== endDate.getTime(),
              status: event.status, // сохраняем статус для возможного использования
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

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateKey = date.toDateString();
      const dayEvents = events[dateKey] || [];

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? "today" : ""}`}
        >
          <div className="day-number">{day}</div>
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
    <section className="calendar container">
      <h3 className="h3-mtmb">Календарь</h3>
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)} className="nav-button">
          ← Предыдущий
        </button>
        <h2>{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="nav-button">
          Следующий →
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
