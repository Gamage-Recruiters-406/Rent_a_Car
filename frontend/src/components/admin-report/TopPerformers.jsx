import { Star } from "lucide-react";

const performers = [
  { name: "Toyota Prius", bookings: 52, revenue: "Rs. 496K", rating: 4.7 },
  { name: "Toyota Aqua", bookings: 45, revenue: "Rs. 562K", rating: 4.9 },
  { name: "Honda Civic", bookings: 38, revenue: "Rs. 684K", rating: 4.8 },
  { name: "Toyota Prius", bookings: 32, revenue: "Rs. 496K", rating: 4.7 },
];

export const TopPerformers = () => {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
      </div>
      <div className="space-y-4">
        {performers.map((performer, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{performer.name}</p>
              <p className="text-xs text-gray-500">
                {performer.bookings} bookings
              </p>
              <p className="text-sm font-semibold text-[#0D3778]">
                {performer.revenue}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium text-[#0D3778]">{performer.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
