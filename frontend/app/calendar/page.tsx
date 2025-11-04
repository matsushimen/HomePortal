"use client";

import { addDays, addMonths, addWeeks, endOfDay, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { useMemo, useState } from "react";
import useSWR from "swr";

import { CreateEventForm } from "@/components/CreateEventForm";
import { CalendarEvent, deleteEvent, fetchEvents } from "@/lib/api";

type CalendarView = "month" | "week" | "day";

type NormalizedEvent = CalendarEvent & {
  startDate: Date;
  endDate: Date;
};

function normalizeEvents(events: CalendarEvent[]): NormalizedEvent[] {
  return events.map((event) => ({
    ...event,
    startDate: parseISO(event.start),
    endDate: parseISO(event.end)
  }));
}

function eventOccursOnDay(event: NormalizedEvent, day: Date) {
  const rangeStart = startOfDay(day).getTime();
  const rangeEnd = endOfDay(day).getTime();
  return event.startDate.getTime() <= rangeEnd && event.endDate.getTime() >= rangeStart;
}

function chunkDays(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeEvent, setActiveEvent] = useState<NormalizedEvent | null>(null);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(selectedDate));
      const end = endOfWeek(endOfMonth(selectedDate));
      return { rangeStart: start, rangeEnd: end };
    }
    if (view === "week") {
      return {
        rangeStart: startOfWeek(selectedDate),
        rangeEnd: endOfWeek(selectedDate)
      };
    }
    return {
      rangeStart: startOfDay(selectedDate),
      rangeEnd: endOfDay(selectedDate)
    };
  }, [view, selectedDate]);

  const { data: events, error, mutate } = useSWR(
    ["events", view, rangeStart.toISOString(), rangeEnd.toISOString()],
    () => fetchEvents({ start: rangeStart.toISOString(), end: rangeEnd.toISOString() })
  );

  const normalizedEvents = useMemo(() => normalizeEvents(events ?? []), [events]);

  const monthMatrix = useMemo(() => {
    if (view !== "month") {
      return [];
    }
    const start = startOfWeek(startOfMonth(selectedDate));
    const end = endOfWeek(endOfMonth(selectedDate));
    const days: Date[] = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return chunkDays(days);
  }, [view, selectedDate]);

  const weekDays = useMemo(() => {
    if (view !== "week") {
      return [];
    }
    const start = startOfWeek(selectedDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      days.push(addDays(start, i));
    }
    return days;
  }, [view, selectedDate]);

  const dayEvents = useMemo(() => {
    if (view !== "day") {
      return [];
    }
    return normalizedEvents.filter((event) => eventOccursOnDay(event, selectedDate));
  }, [view, normalizedEvents, selectedDate]);

  const handlePrev = () => {
    if (view === "month") {
      setSelectedDate((prev) => subMonths(prev, 1));
    } else if (view === "week") {
      setSelectedDate((prev) => subWeeks(prev, 1));
    } else {
      setSelectedDate((prev) => subDays(prev, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setSelectedDate((prev) => addMonths(prev, 1));
    } else if (view === "week") {
      setSelectedDate((prev) => addWeeks(prev, 1));
    } else {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleSelectEvent = (event: NormalizedEvent) => {
    setActiveEvent(event);
  };

  const handleDeleteEvent = async (event: NormalizedEvent) => {
    if (!window.confirm("この予定を削除しますか？")) {
      return;
    }
    await deleteEvent(event.id);
    setActiveEvent(null);
    await mutate();
  };

  const renderMonthView = () => (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-xs">
        <thead>
          <tr className="text-slate-400">
            {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
              <th key={day} className="border-b border-slate-800 px-3 py-2 text-left font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthMatrix.map((week, index) => (
            <tr key={index} className="align-top">
              {week.map((day) => {
                const eventsForDay = normalizedEvents.filter((event) => eventOccursOnDay(event, day));
                return (
                  <td
                    key={day.toISOString()}
                    className={`h-32 border border-slate-900 px-2 py-2 align-top ${
                      isSameMonth(day, selectedDate) ? "bg-slate-900/50" : "bg-slate-900/20"
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div
                      className={`flex items-center justify-between text-xs ${
                        isToday(day) ? "text-brand" : "text-slate-300"
                      }`}
                    >
                      <span>{format(day, "d")}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {eventsForDay.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectEvent(event);
                          }}
                          className="flex w-full items-center gap-2 rounded bg-slate-800/80 px-2 py-1 text-left text-[11px] hover:bg-slate-700"
                          style={{ borderLeft: `4px solid ${event.color ?? "#2563eb"}` }}
                        >
                          <span className="truncate">{event.title}</span>
                        </button>
                      ))}
                      {eventsForDay.length > 3 ? (
                        <div className="text-[10px] text-slate-400">+{eventsForDay.length - 3} 件</div>
                      ) : null}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderWeekView = () => (
    <div className="overflow-x-auto">
      <div className="grid gap-4 md:grid-cols-7">
        {weekDays.map((day) => {
          const eventsForDay = normalizedEvents.filter((event) => eventOccursOnDay(event, day));
          return (
            <div key={day.toISOString()} className="rounded border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{format(day, "M/d (EEE)")}</span>
                {isToday(day) ? <span className="text-brand">Today</span> : null}
              </div>
              <div className="mt-2 space-y-2">
                {eventsForDay.length === 0 ? (
                  <p className="text-xs text-slate-500">予定なし</p>
                ) : (
                  eventsForDay.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-2 text-left text-xs hover:border-brand"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: event.color ?? "#2563eb" }}
                        />
                        <span className="font-medium text-slate-100">{event.title}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {event.all_day ? "終日" : `${format(event.startDate, "HH:mm")} - ${format(event.endDate, "HH:mm")}`}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDayView = () => (
    <div className="space-y-2">
      <div className="rounded border border-slate-800 bg-slate-900/50 p-3">
        <h2 className="text-sm font-semibold text-slate-200">{format(selectedDate, "M月d日 (EEE)")}</h2>
        {dayEvents.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">予定はありません。</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {dayEvents.map((event) => (
              <li key={event.id} className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: event.color ?? "#2563eb" }}
                    />
                    <span className="font-medium text-slate-100">{event.title}</span>
                  </div>
                  <button
                    type="button"
                    className="rounded border border-red-400 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDeleteEvent(event)}
                  >
                    削除
                  </button>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {event.all_day
                    ? "終日"
                    : `${format(event.startDate, "HH:mm")} - ${format(event.endDate, "HH:mm")}`}
                </div>
                {event.notes ? <p className="mt-1 text-xs text-slate-500">{event.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-slate-400">予定を日・週・月ビューで確認できます。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded border border-slate-800 px-3 py-1 text-sm text-slate-200 hover:border-brand"
          >
            前へ
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded border border-slate-800 px-3 py-1 text-sm text-slate-200 hover:border-brand"
          >
            今日
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded border border-slate-800 px-3 py-1 text-sm text-slate-200 hover:border-brand"
          >
            次へ
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {["month", "week", "day"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode as CalendarView)}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              view === mode ? "bg-brand text-white" : "border border-slate-700 text-slate-300 hover:border-brand"
            }`}
          >
            {mode === "month" ? "月" : mode === "week" ? "週" : "日"}
          </button>
        ))}
        <span className="text-sm text-slate-400">{format(selectedDate, "yyyy年 M月 d日")}</span>
      </div>

      <CreateEventForm
        selectedDate={selectedDate}
        onCreated={async () => {
          await mutate();
        }}
      />

      {error ? (
        <div className="card text-sm text-red-400">予定一覧を読み込めませんでした。</div>
      ) : null}

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}

      {activeEvent ? (
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">予定詳細</h2>
            <button
              type="button"
              onClick={() => setActiveEvent(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              閉じる
            </button>
          </div>
          <div className="space-y-2 text-sm text-slate-200">
            <p className="text-base font-semibold">{activeEvent.title}</p>
            <p>{activeEvent.all_day ? "終日" : `${format(activeEvent.startDate, "yyyy/MM/dd HH:mm")} - ${format(activeEvent.endDate, "yyyy/MM/dd HH:mm")}`}</p>
            {activeEvent.created_by ? <p>作成者: {activeEvent.created_by}</p> : null}
            {activeEvent.notes ? <p className="whitespace-pre-wrap text-slate-300">{activeEvent.notes}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDeleteEvent(activeEvent)}
              className="rounded border border-red-400 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
            >
              削除
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
