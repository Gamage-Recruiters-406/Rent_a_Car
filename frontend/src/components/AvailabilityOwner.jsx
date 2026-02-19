import React, { useEffect, useMemo, useState } from "react";
import { getVehicleAvailability } from "../services/bookingApi";

const AvailabilityOwner = ({ isOpen, onClose, vehicle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({}); // { "YYYY-MM-DD": "available"|"blocked" }
  const [availableDays, setAvailableDays] = useState(0);
  const [loading, setLoading] = useState(false);

  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    [],
  );

  const daysOfWeek = useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [],
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const isoKeyUTC = (dateLike) => {
    const d = new Date(dateLike);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // YYYY-MM-DD (UTC)
  };

  const buildMonthMapISO = (year, monthIndex0to11) => {
    const daysInMonth = new Date(year, monthIndex0to11 + 1, 0).getDate();
    const mm = String(monthIndex0to11 + 1).padStart(2, "0");
    const map = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, "0");
      map[`${year}-${mm}-${dd}`] = "available";
    }
    return map;
  };

  const calculateAvailableDays = (map) => {
    const available = Object.values(map).filter(
      (v) => v === "available",
    ).length;
    setAvailableDays(available);
  };

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // previous month fillers
    const firstDow = firstDay.getDay();
    for (let i = 0; i < firstDow; i++) {
      const prev = new Date(year, month, -firstDow + i + 1);
      days.push({
        date: prev.getDate(),
        isCurrentMonth: false,
        fullDate: prev,
      });
    }

    // current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    // next month fillers
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      days.push({
        date: next.getDate(),
        isCurrentMonth: false,
        fullDate: next,
      });
    }

    return days;
  };

  const fetchAvailability = async () => {
    if (!vehicle?._id) return;

    setLoading(true);
    try {
      const res = await getVehicleAvailability(vehicle._id);
      const bookingsArr = res?.data || [];

      console.log("AvailabilityOwner vehicle:", vehicle);
      console.log("RAW backend bookings:", bookingsArr);

      const monthMap = buildMonthMapISO(currentYear, currentMonth);

      bookingsArr.forEach((b) => {
        // OPTIONAL: block only approved
        // if (b.status !== "approved") return;

        const startRaw = b.startingDate ?? b.startDate ?? b.from ?? b.start;
        const endRaw = b.endDate ?? b.to ?? b.end;

        if (!startRaw || !endRaw) return;

        const start = new Date(startRaw);
        const end = new Date(endRaw);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
          return;

        let cur = new Date(
          Date.UTC(
            start.getUTCFullYear(),
            start.getUTCMonth(),
            start.getUTCDate(),
          ),
        );
        const last = new Date(
          Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
        );

        while (cur <= last) {
          const key = `${cur.getUTCFullYear()}-${String(cur.getUTCMonth() + 1).padStart(2, "0")}-${String(cur.getUTCDate()).padStart(2, "0")}`;
          if (key in monthMap) monthMap[key] = "blocked"; // only block visible month
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
      });

      const blockedDays = Object.keys(monthMap).filter(
        (k) => monthMap[k] === "blocked",
      );
      const availableList = Object.keys(monthMap).filter(
        (k) => monthMap[k] === "available",
      );

      console.log("Blocked days (this month):", blockedDays);
      console.log("Available days (this month):", availableList);
      console.log(
        "Counts => blocked:",
        blockedDays.length,
        "available:",
        availableList.length,
      );

      setSelectedDates(monthMap);
      calculateAvailableDays(monthMap);
    } catch (e) {
      console.log("fetchAvailability error:", e);
      const fallback = buildMonthMapISO(currentYear, currentMonth);
      setSelectedDates(fallback);
      calculateAvailableDays(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchAvailability();
  }, [isOpen, vehicle?._id, currentYear, currentMonth]);

  const getDateStatus = (day) => {
    if (!day.isCurrentMonth) return null;
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day.date).padStart(2, "0");
    const key = `${currentYear}-${mm}-${dd}`;
    return selectedDates[key] || "available";
  };

  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;

    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day.date).padStart(2, "0");
    const key = `${currentYear}-${mm}-${dd}`;

    setSelectedDates((prev) => {
      const next = { ...prev };

      // If you want to prevent changing booked days from backend, uncomment:
      // if (next[key] === "blocked") return prev;

      next[key] = next[key] === "available" ? "blocked" : "available";
      calculateAvailableDays(next);
      return next;
    });
  };

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentDate(new Date(currentYear, newMonth, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentDate(new Date(newYear, currentMonth, 1));
  };

  const handleSave = () => {
    console.log("LOCAL ONLY (not saved to DB):", {
      vehicleId: vehicle?._id,
      year: currentYear,
      month: currentMonth,
      selectedDates,
    });
    alert("Saved locally (backend update API not ready yet).");
    onClose();
  };

  if (!isOpen) return null;

  const days = getDaysInMonthGrid(currentDate);

  const yearOptions = [];
  for (let i = currentYear - 1; i <= currentYear + 5; i++) yearOptions.push(i);

  const blockedCount = Object.values(selectedDates).filter(
    (v) => v === "blocked",
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Set Availability for {vehicle?.title || "Vehicle"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Tap days to toggle Available/Blocked</span>
              {loading ? (
                <span className="font-semibold">• Loading…</span>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm font-medium text-gray-700">
                Available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Blocked</span>
            </div>
            <div className="ml-auto text-sm font-semibold text-gray-700">
              Available days:{" "}
              <span className="text-green-600">{availableDays}</span> | Blocked:{" "}
              <span className="text-red-600">{blockedCount}</span>
            </div>
          </div>

          {/* Month/Year Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={handleYearChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Calendar */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-300">
              {daysOfWeek.map((d) => (
                <div
                  key={d}
                  className="text-center py-3 text-sm font-semibold text-gray-600"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const status = getDateStatus(day);
                const today = new Date();
                const isToday =
                  day.isCurrentMonth &&
                  day.date === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      aspect-square flex items-center justify-center text-sm font-medium border-b border-r border-gray-200
                      ${day.isCurrentMonth ? "cursor-pointer" : "cursor-not-allowed"}
                      ${!day.isCurrentMonth ? "text-gray-300 bg-gray-50" : ""}
                      ${day.isCurrentMonth && status === "available" ? "bg-green-100 hover:bg-green-200 text-gray-800" : ""}
                      ${day.isCurrentMonth && status === "blocked" ? "bg-red-100 hover:bg-red-200 text-gray-800" : ""}
                      ${isToday ? "ring-2 ring-blue-500 ring-inset font-bold" : ""}
                      transition-colors
                    `}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{ backgroundColor: "#0D3778" }}
            className="w-full mt-6 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Save Availability (Local)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityOwner;
