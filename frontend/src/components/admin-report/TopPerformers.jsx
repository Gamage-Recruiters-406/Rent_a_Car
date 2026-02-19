import { Star } from "lucide-react";

export const TopPerformers = ({ data = [] }) => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Performers</h3>
        <p className="text-xs text-gray-500">Best rated vehicles</p>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {data.length > 0 ? (
          data.map((vehicle, index) => (
            <div key={vehicle._id || index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{vehicle.title}</p>
                <p className="text-xs text-gray-500">
                  {vehicle.model} • {vehicle.vehicleType}
                </p>
                <p className="text-sm font-semibold text-[#0D3778] mt-1">
                  Rs. {vehicle.pricePerDay}/day
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium text-[#0D3778]">
                    {vehicle.averageRating?.toFixed(1) || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {vehicle.reviewCount || 0} reviews
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
