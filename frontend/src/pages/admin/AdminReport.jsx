import { useState, useEffect } from "react";
import { Users, Car, Calendar, DollarSign, Download, Printer } from "lucide-react";
import { StatCard } from "../../components/admin-report/StatCard";
import { UserGrowthChart } from "../../components/admin-report/UserGrowthChart";
import { FleetStatusChart } from "../../components/admin-report/FleetStatusChart";
import { BookingPerformanceChart } from "../../components/admin-report/BookingPerformanceChart";
import { RevenueTargetChart } from "../../components/admin-report/RevenueTargetChart";
import { TopPerformers } from "../../components/admin-report/TopPerformers";
import { RecentTransactions } from "../../components/admin-report/RecentTransactions";
import { 
  getUserReportStats, 
  getVehicleReportStats, 
  getBookingReportStats,
  getMonthlyUserChart,
  getVehicleAvailabilityReport,
  getMonthlyBookingChart,
  getBestPerformanceVehicles
} from "../../services/adminReportApi";
import Layout from "../../layouts/Layout";

const AdminReport = () => {
  const [userStats, setUserStats] = useState({ totalUsers: 0, thisMonthUsers: 0, percentage: 0 });
  const [vehicleStats, setVehicleStats] = useState({ totalVehicles: 0, thisMonthVehicles: 0, percentage: 0 });
  const [bookingStats, setBookingStats] = useState({ totalBookings: 0, thisMonthBookings: 0, percentage: 0 });
  const [userChartData, setUserChartData] = useState([]);
  const [vehicleAvailability, setVehicleAvailability] = useState({ totals: {}, percentages: {} });
  const [bookingChartData, setBookingChartData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all admin report data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [users, vehicles, bookings, userChart, availability, bookingChart, performers] = await Promise.all([
          getUserReportStats(),
          getVehicleReportStats(),
          getBookingReportStats(),
          getMonthlyUserChart(),
          getVehicleAvailabilityReport(),
          getMonthlyBookingChart(),
          getBestPerformanceVehicles(5)
        ]);

        // Set all state
        if (users.success) {
          setUserStats({
            totalUsers: users.totalUsers,
            thisMonthUsers: users.thisMonthUsers,
            percentage: users.percentage
          });
        }

        if (vehicles.success) {
          setVehicleStats({
            totalVehicles: vehicles.totalVehicles,
            thisMonthVehicles: vehicles.thisMonthVehicles,
            percentage: vehicles.percentage
          });
        }

        if (bookings.success) {
          setBookingStats({
            totalBookings: bookings.totalBookings,
            thisMonthBookings: bookings.thisMonthBookings,
            percentage: bookings.percentage
          });
        }

        if (userChart.success) {
          setUserChartData(userChart.data);
        }

        if (availability.success) {
          setVehicleAvailability(availability.data);
        }

        if (bookingChart.success) {
          setBookingChartData(bookingChart.data);
        }

        if (performers.success) {
          setTopPerformers(performers.data);
        }

      } catch (err) {
        console.error('Error fetching admin report data:', err);
        setError(err.message || 'Failed to load admin report data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleDownloadReport = () => {
    // Create report content with real data
    const reportContent = `
VEHICLE RENTAL ADMIN REPORT
Generated: ${new Date().toLocaleString()}
=====================================

SUMMARY STATISTICS
------------------
Total Users: ${userStats.totalUsers}
Total Vehicles: ${vehicleStats.totalVehicles}
Total Bookings: ${bookingStats.totalBookings}
Total Revenue: Rs. 0

This Month Growth:
- New Users: ${userStats.thisMonthUsers} (${userStats.percentage}%)
- New Vehicles: ${vehicleStats.thisMonthVehicles} (${vehicleStats.percentage}%)
- New Bookings: ${bookingStats.thisMonthBookings} (${bookingStats.percentage}%)

FLEET STATUS
------------
Total Vehicles: ${vehicleAvailability.totals?.totalVehicles || 0}
Available: ${vehicleAvailability.totals?.availableVehicles || 0} (${vehicleAvailability.percentages?.available || 0}%)
Booked: ${vehicleAvailability.totals?.bookedVehicles || 0} (${vehicleAvailability.percentages?.booked || 0}%)

USER GROWTH TREND
-----------------
${userChartData.map(item => `${item.month}: ${item.newUsers} new users (Total: ${item.totalUsers})`).join('\n')}

BOOKING PERFORMANCE
-------------------
${bookingChartData.map(item => `${item.month}: ${item.bookings} bookings`).join('\n')}

TOP PERFORMING VEHICLES
-----------------------
${topPerformers.map((v, i) => `${i + 1}. ${v.title} (${v.model})
   Rating: ${v.averageRating?.toFixed(1)} (${v.reviewCount} reviews)
   Price: Rs. ${v.pricePerDay}/day`).join('\n')}
    `;

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-12 print:p-8 print:bg-white">
        <div className="max-w-full space-y-4 md:space-y-6 print:space-y-6">
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading admin report data...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading data:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                title="Total Users"
                value={userStats.totalUsers.toString()}
                subtitle={`+${userStats.thisMonthUsers} this month`}
                change={`${userStats.percentage}%`}
                changeType={userStats.percentage >= 0 ? "positive" : "negative"}
                icon={Users}
                variant="users"
              />
              <StatCard
                title="Total Vehicles"
                value={vehicleStats.totalVehicles.toString()}
                subtitle={`+${vehicleStats.thisMonthVehicles} this month`}
                change={`${vehicleStats.percentage}%`}
                changeType={vehicleStats.percentage >= 0 ? "positive" : "negative"}
                icon={Car}
                variant="vehicles"
              />
              <StatCard
                title="Total Bookings"
                value={bookingStats.totalBookings.toString()}
                subtitle={`+${bookingStats.thisMonthBookings} this month`}
                change={`${bookingStats.percentage}%`}
                changeType={bookingStats.percentage >= 0 ? "positive" : "negative"}
                icon={Calendar}
                variant="bookings"
              />
              <StatCard
                title="Total Revenue"
                value="Rs. 0"
                subtitle="Coming soon"
                change="0%"
                changeType="positive"
                icon={DollarSign}
                variant="revenue"
              />
            </div>

            {/* User Growth + Fleet Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <UserGrowthChart data={userChartData} />
              </div>
              <div>
                <FleetStatusChart data={vehicleAvailability} />
              </div>
            </div>

            {/* Booking Performance + Revenue Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BookingPerformanceChart data={bookingChartData} />
              <RevenueTargetChart />
            </div>

            {/* Top Performers + Transactions */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              <div className="xl:col-span-1">
                <TopPerformers data={topPerformers} />
              </div>
              <div className="xl:col-span-3">
                <RecentTransactions />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 print:hidden">
              <button 
                onClick={handleDownloadReport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0D3778] hover:bg-[#0A2855] text-white rounded-lg font-medium text-sm sm:text-base"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download Full Report</span>
                <span className="sm:hidden">Download</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm sm:text-base"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
    </Layout>
  );
};

export default AdminReport;



