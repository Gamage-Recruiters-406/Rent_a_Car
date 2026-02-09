import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const BookingPerformanceChart = ({ data = [] }) => {
  // Transform data from backend format to chart format
  const chartData = data.length > 0 
    ? data.map(item => ({
        month: item.month.substring(5), // Get "MM" from "YYYY-MM"
        bookings: item.bookings
      }))
    : [
        { month: "01", bookings: 0 },
        { month: "02", bookings: 0 },
        { month: "03", bookings: 0 },
        { month: "04", bookings: 0 },
        { month: "05", bookings: 0 },
        { month: "06", bookings: 0 },
      ];

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Booking Performance</h3>
        <p className="text-xs sm:text-sm text-gray-500">Monthly booking volume</p>
      </div>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="bookings"
              fill="#0D3778"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
