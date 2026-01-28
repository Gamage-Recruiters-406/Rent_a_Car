export default function MiniCalendar({ month }) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDay = new Date(year, mon, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-7 gap-1 bg-slate-100 p-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div
            key={w}
            className="text-center text-[11px] font-semibold text-slate-700"
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-2">
        {cells.map((d, idx) => {
          if (d === null) return <div key={idx} className="h-9 sm:h-10" />;

          const demoColor =
            d % 9 === 0
              ? "bg-red-100 border-red-300"
              : d % 7 === 0
                ? "bg-emerald-100 border-emerald-300"
                : "bg-white border-slate-200";

          return (
            <div
              key={idx}
              className={`h-9 sm:h-10 flex items-center justify-center rounded-lg text-[12px] border ${demoColor}`}
            >
              {d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
