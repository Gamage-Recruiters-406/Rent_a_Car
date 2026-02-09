import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const UserGrowthChart = ({ data = [] }) => {
  // Transform data from backend format to chart format
  const chartData = data.length > 0 
    ? data.map(item => ({
        month: item.month.substring(5), // Get "MM" from "YYYY-MM"
        totalUsers: item.totalUsers,
        newUsers: item.newUsers
      }))
    : [
        { month: "01", totalUsers: 0, newUsers: 0 },
        { month: "02", totalUsers: 0, newUsers: 0 },
        { month: "03", totalUsers: 0, newUsers: 0 },
        { month: "04", totalUsers: 0, newUsers: 0 },
        { month: "05", totalUsers: 0, newUsers: 0 },
        { month: "06", totalUsers: 0, newUsers: 0 },
      ];

  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">User Growth Trend</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Monthly active users and new registrations
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0D3778]" />
            <span className="text-gray-500">Total Users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00C950]" />
            <span className="text-gray-500">New Users</span>
          </div>
        </div>
      </div>
      <div className="h-[200px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D3778" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0D3778" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C950" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C950" stopOpacity={0} />
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="#0D3778"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="#00C950"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNew)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
