import { useEffect, useState } from 'react';
import { Users, Car, DollarSign, Calendar, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../layouts/Layout';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

const StatCard = ({ icon: Icon, title, value, subtitle, bgColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-md border-l-[6px] border-l-[#0D3778] hover:shadow-xl transition-all">
    <div className="flex items-center gap-5">
      <div className={`p-5 rounded-2xl ${bgColor} flex-shrink-0 shadow-lg`}>
        <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
        <h3 className="text-4xl font-bold text-[#0D3778]">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const RentStatusChart = ({ available = 0, booked = 0, maintenance = 0 }) => {
  const total = available + booked + maintenance || 1;
  const availablePercent = (available / total) * 100;
  const bookedPercent = (booked / total) * 100;
  const maintenancePercent = (maintenance / total) * 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <h3 className="text-base font-semibold text-[#0D3778] mb-6">Rent Status</h3>
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#0D3778"
              strokeWidth="18"
              strokeDasharray={`${availablePercent * 1.88} 188.4`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#10B981"
              strokeWidth="18"
              strokeDasharray={`${bookedPercent * 1.88} 188.4`}
              strokeDashoffset={`-${availablePercent * 1.88}`}
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="18"
              strokeDasharray={`${maintenancePercent * 1.88} 188.4`}
              strokeDashoffset={`-${(availablePercent + bookedPercent) * 1.88}`}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0D3778]"></div>
              <span className="text-xs font-medium text-slate-600">Available</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{available}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-slate-600">Booked</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{booked}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <span className="text-xs font-medium text-slate-600">Maintenance</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">{maintenance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingOverviewChart = ({ data = [] }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.done, d.cancelled)), 1);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-[#0D3778]">Booking Overview</h3>
        <span className="text-xs px-2.5 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">This Year</span>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#0D3778]"></div>
          <span className="text-xs font-medium text-slate-600">Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-xs font-medium text-slate-600">Cancelled</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-right pr-2" style={{ width: '40px', height: '280px' }}>
          <span className="text-xs text-slate-500 font-medium">400</span>
          <span className="text-xs text-slate-500 font-medium">200</span>
          <span className="text-xs text-slate-500 font-medium">0</span>
          <span className="text-xs text-slate-500 font-medium">200</span>
          <span className="text-xs text-slate-500 font-medium">400</span>
        </div>

        {/* Chart area */}
        <div className="flex-1">
          {/* Grid lines and bars */}
          <div style={{ height: '280px' }} className="relative flex items-center justify-between gap-1">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t-2 border-slate-400"></div>
              <div className="border-t border-dashed border-slate-300"></div>
              <div className="border-t border-dashed border-slate-300"></div>
            </div>

            {/* Bars */}
            <div className="w-full h-full flex items-center justify-between gap-1 relative z-10">
              {data.map((item, index) => {
                const doneHeight = (item.done / maxValue) * 50;
                const cancelledHeight = (item.cancelled / maxValue) * 50;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-center">
                    {/* Done bar - goes up from center */}
                    <div className="w-1/3 flex flex-col-reverse items-center justify-start" style={{ height: '50%' }}>
                      <div
                        className="w-full bg-[#0D3778] rounded-t"
                        style={{ height: `${doneHeight}%`, minHeight: doneHeight > 0 ? '2px' : '0px' }}
                      ></div>
                    </div>

                    {/* Center line (0) */}
                    <div className="w-full border-b border-slate-400"></div>

                    {/* Cancelled bar - goes down from center */}
                    <div className="w-1/3 flex flex-col items-center justify-start" style={{ height: '50%' }}>
                      <div
                        className="w-full bg-red-500 rounded-b"
                        style={{ height: `${cancelledHeight}%`, minHeight: cancelledHeight > 0 ? '2px' : '0px' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Months labels below chart */}
          <div className="flex justify-between gap-1 mt-3">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="text-xs text-slate-600 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MostRentedCars = ({ vehicles = [] }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
    <h3 className="text-lg font-semibold text-[#0D3778] mb-6">Most Rented Cars</h3>
    <div className="space-y-4">
      {vehicles.map((vehicle, index) => (
        <div key={index} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-b-0">
          <img
            src={vehicle.image || 'https://via.placeholder.com/60'}
            alt={vehicle.title}
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-slate-900">{vehicle.title}</h4>
            <p className="text-sm text-slate-500">{vehicle.numberPlate}</p>
          </div>
          <span className="text-base font-semibold text-[#0D3778] whitespace-nowrap">{vehicle.rentCount} Rents</span>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
  });
  const [rentStatus, setRentStatus] = useState({
    available: 0,
    booked: 0,
    maintenance: 0,
  });
  const [bookingData, setBookingData] = useState([]);
  const [mostRentedCars, setMostRentedCars] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, vehiclesRes, bookingsRes] = await Promise.all([
        fetch(`${baseUrl}${apiVersion}/authUser/getAllUsers`, {
          credentials: 'include',
        }),
        fetch(`${baseUrl}${apiVersion}/vehicle/admin/get-all`, {
          credentials: 'include',
        }),
        fetch(`${baseUrl}${apiVersion}/bookings/get`, {
          credentials: 'include',
        }),
      ]);

      const usersData = await usersRes.json();
      const vehiclesData = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();

      if (usersData.success && vehiclesData.success && bookingsData.success) {
        const users = usersData.users || [];
        const vehicles = vehiclesData.vehicles || [];
        const bookings = bookingsData.data || [];

        const totalRevenue = bookings
          .filter(b => b.status === 'approved')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const pendingCount = bookings.filter(b => b.status === 'pending').length;
        const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

        const approvedVehicles = vehicles.filter(v => v.status === 'Approved');
        const bookedVehicleIds = new Set(
          bookings
            .filter(b => b.status === 'approved' || b.status === 'pending')
            .map(b => b.vehicleId?._id || b.vehicleId)
        );

        const bookedCount = approvedVehicles.filter(v => bookedVehicleIds.has(v._id)).length;
        const availableCount = approvedVehicles.length - bookedCount;

        setStats({
          totalUsers: users.length,
          totalVehicles: vehicles.length,
          totalRevenue,
          totalBookings: bookings.length,
          pendingBookings: pendingCount,
          cancelledBookings: cancelledCount,
        });

        setRentStatus({
          available: availableCount,
          booked: bookedCount,
          maintenance: 0,
        });

        const monthlyData = calculateMonthlyBookings(bookings);
        setBookingData(monthlyData);

        const rentedCars = calculateMostRentedCars(bookings, vehicles);
        setMostRentedCars(rentedCars);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyBookings = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyStats = months.map((month, index) => {
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === index;
      });

      return {
        month,
        done: monthBookings.filter(b => b.status === 'approved').length,
        cancelled: monthBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
      };
    });

    return monthlyStats;
  };

  const calculateMostRentedCars = (bookings, vehicles) => {
    const vehicleRentCount = {};

    bookings.forEach(booking => {
      const vehicleId = booking.vehicleId?._id || booking.vehicleId;
      if (vehicleId && (booking.status === 'approved' || booking.status === 'pending')) {
        vehicleRentCount[vehicleId] = (vehicleRentCount[vehicleId] || 0) + 1;
      }
    });

    const sortedVehicles = Object.entries(vehicleRentCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([vehicleId, count]) => {
        const vehicle = vehicles.find(v => v._id === vehicleId);
        return {
          title: vehicle?.title || vehicle?.model || 'Unknown',
          numberPlate: vehicle?.numberPlate || 'N/A',
          rentCount: count,
          image: vehicle?.photos?.[0]?.url || null,
        };
      });

    return sortedVehicles;
  };

  if (loading) {
    return (
      <Layout showFooter={true}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0D3778] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={true}>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0D3778] mb-8">Admin Dashboard</h1>

          {/* Top Section - Stats Cards Left + Rent Status Right */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Left Side - Stats Cards */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={Users}
                  title="Total Users"
                  value={stats.totalUsers}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={Car}
                  title="Total Vehicles"
                  value={stats.totalVehicles}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={DollarSign}
                  title="Total Revenue (LKR)"
                  value={stats.totalRevenue.toLocaleString()}
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={Calendar}
                  title="Total Bookings"
                  value={stats.totalBookings}
                  subtitle="Owners + Customers"
                  bgColor="bg-[#0D3778]"
                />
                <StatCard
                  icon={Clock}
                  title="Pending Bookings"
                  value={stats.pendingBookings}
                  bgColor="bg-amber-500"
                />
                <StatCard
                  icon={XCircle}
                  title="Canceled Bookings"
                  value={stats.cancelledBookings}
                  bgColor="bg-red-500"
                />
              </div>
            </div>

            {/* Right Side - Rent Status */}
            <div className="lg:col-span-1">
              <RentStatusChart
                available={rentStatus.available}
                booked={rentStatus.booked}
                maintenance={rentStatus.maintenance}
              />
            </div>
          </div>

          {/* Bottom Section - Booking Overview Left + Most Rented Cars Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BookingOverviewChart data={bookingData} />
            </div>
            <div className="lg:col-span-1">
              <MostRentedCars vehicles={mostRentedCars} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
