import React, { useState, useEffect } from 'react';
import { Car, Calendar, DollarSign, Star, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from "../../layouts/Layout";
import { getOwnerBookings, getOwnerEarnings, getMyVehicleListings, getMyVehicleReviews } from '../../services/ownerApi';
import { api } from '../../services/vehicleApi';

// --- Components ---

const MetricCard = ({ title, value, icon: Icon, colorClass, iconColorClass }) => (
  <div className={`rounded-xl p-4 sm:p-6 flex flex-col justify-between h-32 ${colorClass}`}>
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{value}</div>
      </div>
      <div className={`p-2 rounded-lg bg-white ${iconColorClass}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
    </div>
);

const EarningsChart = ({ data = [] }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Monthly Earnings</h3>
          <p className="text-sm text-gray-500">Your earnings over time</p>
        </div>
      </div>
      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No earnings data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0D3778"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0D3778', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const BookingStatusCard = ({ approved = 0, pending = 0, rejected = 0 }) => {
  const statuses = [
    { label: 'Approved', count: approved, color: 'bg-green-50 text-green-600', dot: 'bg-green-500' },
    { label: 'Pending', count: pending, color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
    { label: 'Rejected', count: rejected, color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6">Booking Status</h3>
      <div className="flex flex-col gap-3 sm:gap-4 flex-grow justify-center">
        {statuses.map((status) => (
          <div key={status.label} className={`flex items-center justify-between p-4 rounded-lg ${status.color}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${status.dot}`}></div>
              <span className="font-medium text-sm">{status.label}</span>
            </div>
            <span className="font-bold">{status.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentBookingsTable = ({ bookings = [], onViewBooking }) => {
    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return 'bg-orange-100 text-orange-600';
            case 'approved': return 'bg-green-100 text-green-600';
            case 'rejected': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    const formatDates = (start, end) => {
        const s = start ? new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
        const e = end ? new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
        return s && e ? `${s} – ${e}` : s || e || '-';
    };

    const VehicleIcon = () => (
        <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-100 text-blue-600">
            <Car size={16} />
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Bookings</h3>
                <p className="text-sm text-gray-500">Manage your recent vehicle bookings</p>
            </div>

            {bookings.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No bookings found</div>
            ) : (
              <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 min-w-[600px]">
                    <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-400">
                        <tr>
                            <th className="px-4 sm:px-6 py-4">Vehicle</th>
                            <th className="px-4 sm:px-6 py-4">Customer</th>
                            <th className="px-4 sm:px-6 py-4">Dates</th>
                            <th className="px-4 sm:px-6 py-4 text-center">Status</th>
                            <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {bookings.map((booking) => {
                            const vehicleName = booking.vehicleId?.title || booking.vehicleId?.model || 'N/A';
                            const customerName = booking.customerId
                                ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim()
                                : 'N/A';
                            return (
                            <tr key={booking._id} className="hover:bg-gray-50/50">
                                <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <VehicleIcon />
                                        <span className="truncate max-w-[120px] sm:max-w-none">{vehicleName}</span>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 truncate max-w-[100px] sm:max-w-none">{customerName}</td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{formatDates(booking.startingDate, booking.endDate)}</td>
                                <td className="px-4 sm:px-6 py-4 text-center">
                                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                                        {formatStatus(booking.status)}
                                    </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-center">
                                    <button
                                        className="text-xs font-medium text-gray-500 border border-gray-200 rounded px-2 sm:px-3 py-1 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                        onClick={() => onViewBooking(booking)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col gap-4 p-4 pt-0">
                {bookings.map((booking) => {
                    const vehicleName = booking.vehicleId?.title || booking.vehicleId?.model || 'N/A';
                    const customerName = booking.customerId
                        ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim()
                        : 'N/A';
                    return (
                    <div key={booking._id} className="border border-gray-100 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <VehicleIcon />
                                <div>
                                    <h4 className="font-medium text-gray-900">{vehicleName}</h4>
                                    <p className="text-xs text-gray-500">{customerName}</p>
                                </div>
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold ${getStatusStyle(booking.status)}`}>
                                {formatStatus(booking.status)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-600">
                                <span className="text-xs text-gray-400 block mb-1">Dates</span>
                                <span className="font-medium">{formatDates(booking.startingDate, booking.endDate)}</span>
                            </div>
                            <button
                                className="text-xs font-medium text-gray-500 border border-gray-200 rounded px-4 py-2 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                onClick={() => onViewBooking(booking)}
                            >
                                View
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>
              </>
            )}
        </div>
    );
};

const NotificationItem = ({ item }) => (
    <div
        className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
        <div className={`p-2 rounded-lg ${item.color || 'bg-gray-100 text-gray-600'}`}>
            {item.icon ? <item.icon size={18} /> : <Calendar size={18} />}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-800">{item.text || item.message}</p>
            <p className="text-xs text-gray-400 mt-1">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString() : '')}</p>
        </div>
    </div>
);

const BookingPopup = ({ booking, onClose }) => {
  const vehicleName = booking.vehicleId?.title || booking.vehicleId?.model || 'N/A';
  const vehicleType = booking.vehicleId?.vehicleType || booking.vehicleId?.type || '';
  const customerName = booking.customerId
    ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim()
    : 'N/A';
  const location = booking.vehicleId?.location?.address || booking.vehicleId?.city || '-';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const dates = `${formatDate(booking.startingDate)} – ${formatDate(booking.endDate)}`;

  const statusStyle =
    booking.status === 'pending' ? 'bg-orange-100 text-orange-600' :
    booking.status === 'approved' ? 'bg-green-100 text-green-600' :
    'bg-red-100 text-red-600';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Car size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{vehicleName}</h4>
              {vehicleType && <p className="text-sm text-gray-500 capitalize">{vehicleType}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer</p>
              <p className="font-medium text-gray-900">{customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : ''}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Dates</p>
              <p className="font-medium text-gray-900">{dates}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="font-medium text-gray-900">{location}</p>
            </div>
            <div className="col-span-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-500">Total Price</p>
                <p className="text-xl font-bold text-gray-900">Rs. {booking.totalAmount?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [earningsData, setEarningsData] = useState({ totalEarnings: 0, totalBookings: 0 });
  const [monthlyEarningsChart, setMonthlyEarningsChart] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const userStr = localStorage.getItem('user');
  const user = (userStr && userStr !== 'undefined' && userStr !== 'null') ? JSON.parse(userStr) : {};
  const ownerId = user._id || user.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch bookings
        const bookingsRes = await getOwnerBookings().catch(() => ({ data: [] }));
        const allBookings = bookingsRes?.data || [];
        setBookings(allBookings);

        // Fetch vehicles
        const vehiclesRes = await getMyVehicleListings().catch(() => ({ vehicles: [] }));
        const allVehicles = vehiclesRes?.vehicles || vehiclesRes?.data || [];
        setVehicles(allVehicles);

        // Build monthly chart data sorted by calendar month order
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyMap = {};
        let totalFromBookings = 0;
        allBookings.forEach((b) => {
          if (b.status === 'approved' && b.startingDate) {
            const monthIdx = new Date(b.startingDate).getMonth();
            const month = monthNames[monthIdx];
            monthlyMap[month] = { value: (monthlyMap[month]?.value || 0) + (b.totalAmount || 0), idx: monthIdx };
            totalFromBookings += (b.totalAmount || 0);
          }
        });
        const sortedChart = Object.entries(monthlyMap)
          .sort((a, b) => a[1].idx - b[1].idx)
          .map(([name, { value }]) => ({ name, value }));
        setMonthlyEarningsChart(sortedChart);
        setEarningsData({ totalEarnings: totalFromBookings, totalBookings: allBookings.filter(b => b.status === 'approved').length });

        // Fetch reviews for average rating
        const reviewsRes = await getMyVehicleReviews().catch(() => null);
        if (reviewsRes?.vehicleStats?.length) {
          const totalRating = reviewsRes.vehicleStats.reduce((sum, v) => sum + v.averageRating, 0);
          setAvgRating((totalRating / reviewsRes.vehicleStats.length).toFixed(1));
        }

        // Fetch notifications
        const notifRes = await api.get('/notification/me').catch(() => ({ data: { data: [] } }));
        setNotifications((notifRes?.data?.data || []).slice(0, 5));

      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [ownerId]);

  const activeBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;

  const formatEarnings = (amount) => {
    if (!amount) return 'Rs. 0';
    if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(0)}K`;
    return `Rs. ${amount}`;
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const closePopup = () => {
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  const recentBookings = bookings.slice(0, 5);

  return (
    <>
    <Layout>
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 relative">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <MetricCard
            title="Total Vehicles"
            value={vehicles.length}
            icon={Car}
            colorClass="bg-blue-50/50"
            iconColorClass="text-blue-600"
          />
          <MetricCard
            title="Active Bookings"
            value={activeBookings}
            icon={Calendar}
            colorClass="bg-green-50/50"
            iconColorClass="text-green-600"
          />
          <MetricCard
            title="Total Earnings"
            value={formatEarnings(earningsData.totalEarnings)}
            icon={DollarSign}
            colorClass="bg-purple-50/50"
            iconColorClass="text-purple-600"
          />
          <MetricCard
            title="Average Rating"
            value={avgRating || 'N/A'}
            icon={Star}
            colorClass="bg-yellow-50/50"
            iconColorClass="text-yellow-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 h-full">
            <EarningsChart data={monthlyEarningsChart} />
          </div>
          <div className="h-full">
            <BookingStatusCard
              approved={activeBookings}
              pending={pendingBookings}
              rejected={rejectedBookings}
            />
          </div>
        </div>

        {/* Recent Bookings */}
        <RecentBookingsTable bookings={recentBookings} onViewBooking={handleViewBooking} />

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Recent Notifications</h3>
            </div>
            <div className="space-y-1">
                {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No notifications</p>
                ) : (
                    notifications.map(item => (
                        <NotificationItem key={item._id} item={{
                            ...item,
                            text: item.message,
                            color: 'text-blue-500 bg-blue-100',
                            icon: Calendar,
                        }} />
                    ))
                )}
            </div>
        </div>

      </div>
    </Layout>
    {/* Booking Details Popup — rendered outside Layout to avoid overflow/z-index clipping */}
    {selectedBooking && (
      <BookingPopup booking={selectedBooking} onClose={closePopup} />
    )}
  </>);
};

export default OwnerDashboard;
