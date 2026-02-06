import React, { useState, useEffect } from "react";

const AvailabilityOwner = ({ isOpen, onClose, vehicle }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState({});
    const [availableDays, setAvailableDays] = useState(0);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize with default availability (all days available)
    useEffect(() => {
        if (isOpen && vehicle) {
            const dates = {};
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${year}-${month}-${day}`;
                dates[dateKey] = "available"; // Default to available
            }

            setSelectedDates(dates);
            calculateAvailableDays(dates);
        }
    }, [isOpen, currentDate, vehicle]);

    const calculateAvailableDays = (dates) => {
        const available = Object.values(dates).filter((status) => status === "available").length;
        setAvailableDays(available);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const days = [];

        // Add empty cells for days before the first day of the month
        const firstDayOfWeek = firstDay.getDay();
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
            days.push({
                date: prevMonthDay.getDate(),
                isCurrentMonth: false,
                fullDate: prevMonthDay
            });
        }

        // Add days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            days.push({
                date: day,
                isCurrentMonth: true,
                fullDate: new Date(year, month, day)
            });
        }

        // Add empty cells for days after the last day of the month
        const remainingCells = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDay = new Date(year, month + 1, i);
            days.push({
                date: nextMonthDay.getDate(),
                isCurrentMonth: false,
                fullDate: nextMonthDay
            });
        }

        return days;
    };

    const handleDateClick = (day) => {
        if (!day.isCurrentMonth) return;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateKey = `${year}-${month}-${day.date}`;

        const newSelectedDates = { ...selectedDates };

        // Toggle between available and blocked
        if (newSelectedDates[dateKey] === "available") {
            newSelectedDates[dateKey] = "blocked";
        } else {
            newSelectedDates[dateKey] = "available";
        }

        setSelectedDates(newSelectedDates);
        calculateAvailableDays(newSelectedDates);
    };

    const getDateStatus = (day) => {
        if (!day.isCurrentMonth) return null;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateKey = `${year}-${month}-${day.date}`;

        return selectedDates[dateKey] || "available";
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleMonthChange = (e) => {
        const newMonth = parseInt(e.target.value);
        setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e) => {
        const newYear = parseInt(e.target.value);
        setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
    };

    const handleSave = () => {
        // TODO: Implement save functionality - send to backend
        console.log("Saving availability:", selectedDates);
        // You can call an API here to save the availability
        onClose();
    };

    if (!isOpen) return null;

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const days = getDaysInMonth(currentDate);

    // Generate year options (current year - 5 to current year + 5)
    const yearOptions = [];
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
        yearOptions.push(i);
    }

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
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Tap days to toggle Available/Blocked</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Calendar Body */}
                <div className="p-6">
                    {/* Legend */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                            <span className="text-sm font-medium text-gray-700">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
                            <span className="text-sm font-medium text-gray-700">Blocked</span>
                        </div>
                        <div className="ml-auto text-sm font-semibold text-gray-700">
                            Available days: <span className="text-green-600">{availableDays}</span>
                        </div>
                    </div>

                    {/* Month/Year Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3">
                            <select
                                value={currentMonth}
                                onChange={handleMonthChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={currentYear}
                                onChange={handleYearChange}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-300">
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className="text-center py-3 text-sm font-semibold text-gray-600"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7">
                            {days.map((day, index) => {
                                const status = getDateStatus(day);
                                const isToday = day.isCurrentMonth &&
                                    day.date === new Date().getDate() &&
                                    currentMonth === new Date().getMonth() &&
                                    currentYear === new Date().getFullYear();

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

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        style={{ backgroundColor: "#0D3778" }}
                        className="w-full mt-6 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save Availability
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityOwner;
