import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", bookings: 650 },
  { month: "Feb", bookings: 800 },
  { month: "Mar", bookings: 720 },
  { month: "Apr", bookings: 880 },
  { month: "May", bookings: 780 },
  { month: "Jun", bookings: 890 },
];

export const BookingPerformanceChart = () => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Booking Performance</h3>
        <p className="text-sm text-gray-500">Monthly booking volume</p>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <BarChart data={data}>
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
