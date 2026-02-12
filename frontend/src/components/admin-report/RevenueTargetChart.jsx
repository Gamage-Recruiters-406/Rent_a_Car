import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", actual: 450000, target: 500000 },
  { month: "Feb", actual: 520000, target: 550000 },
  { month: "Mar", actual: 580000, target: 600000 },
  { month: "Apr", actual: 620000, target: 650000 },
  { month: "May", actual: 710000, target: 700000 },
  { month: "Jun", actual: 780000, target: 750000 },
];

const formatValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return value.toString();
};

export const RevenueTargetChart = () => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Revenue vs Target</h3>
        <p className="text-xs sm:text-sm text-gray-500">Actual revenue against targets</p>
      </div>
      <div className="h-[180px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D3778" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0D3778" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
              formatter={(value) => [`Rs. ${formatValue(value)}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#0D3778"
              strokeWidth={2}
              dot={{ fill: "#0D3778", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
