type EventItem = {
  id: number;
  title: string;
  start: string;
  end: string;
  color?: string | null;
};

type Props = {
  events: EventItem[];
};

function formatEventRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit"
  });
  const timeFormatter = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit"
  });
  if (sameDay) {
    return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
  }
  return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} → ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`;
}

export function EventList({ events }: Props) {
  return (
    <section className="card">
      <h2 className="text-lg font-semibold">Calendar</h2>
      <ul className="mt-4 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rounded border border-slate-800/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{event.title}</p>
              {event.color ? <span className="h-2 w-6 rounded-full" style={{ backgroundColor: event.color }} /> : null}
            </div>
            <p className="text-xs text-slate-400">{formatEventRange(event.start, event.end)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

