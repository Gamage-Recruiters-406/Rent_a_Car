import PropTypes from 'prop-types';

const variantStyles = {
  users: "bg-[#0D3778]",
  vehicles: "bg-[#00C950]",
  bookings: "bg-[#FF6900]",
  revenue: "bg-[#AD46FF]",
};

const borderStyles = {
  users: "border-l-[#0D3778]",
  vehicles: "border-l-[#00C950]",
  bookings: "border-l-[#FF6900]",
  revenue: "border-l-[#AD46FF]",
};

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon: Icon,
  variant,
}) => {
  return (
    <div className={`rounded-xl bg-white p-5 shadow-sm border border-gray-200 border-l-4 ${borderStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className={`text-sm font-medium ${changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
          {changeType === "positive" ? "+" : ""}
          {change}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  change: PropTypes.string.isRequired,
  changeType: PropTypes.oneOf(['positive', 'negative']).isRequired,
  icon: PropTypes.elementType.isRequired,
  variant: PropTypes.oneOf(['users', 'vehicles', 'bookings', 'revenue']).isRequired,
};
