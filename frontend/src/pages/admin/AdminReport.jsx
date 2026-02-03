import { Users, Car, Calendar, DollarSign, Download, Printer } from "lucide-react";
import { StatCard } from "../../components/admin-report/StatCard";
import { UserGrowthChart } from "../../components/admin-report/UserGrowthChart";
import { FleetStatusChart } from "../../components/admin-report/FleetStatusChart";
import { BookingPerformanceChart } from "../../components/admin-report/BookingPerformanceChart";
import { RevenueTargetChart } from "../../components/admin-report/RevenueTargetChart";
import { TopPerformers } from "../../components/admin-report/TopPerformers";
import { RecentTransactions } from "../../components/admin-report/RecentTransactions";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";

const AdminReport = () => {
  const handleDownloadReport = () => {
    // Create report content
    const reportContent = `
VEHICLE RENTAL ADMIN REPORT
Generated: ${new Date().toLocaleString()}
=====================================

SUMMARY STATISTICS
------------------
Total Users: 0
Total Vehicles: 0
Total Bookings: 0
Total Revenue: Rs. 0

FLEET STATUS
------------
Available: 0
Booked: 0
Maintenance: 0

TOP PERFORMERS
--------------
No data available

RECENT TRANSACTIONS
-------------------
No transactions available
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
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Header />
      <div className="flex-1 overflow-auto bg-gray-50 p-12">
        <div className="max-w-full space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            title="Total Users"
            value="0"
            subtitle="No data"
            change="0%"
            changeType="positive"
            icon={Users}
            variant="users"
          />
          <StatCard
            title="Total Vehicles"
            value="0"
            subtitle="No data"
            change="0%"
            changeType="positive"
            icon={Car}
            variant="vehicles"
          />
          <StatCard
            title="Total Bookings"
            value="0"
            subtitle="No data"
            change="0%"
            changeType="positive"
            icon={Calendar}
            variant="bookings"
          />
          <StatCard
            title="Total Revenue"
            value="Rs. 0"
            subtitle="No data"
            change="0%"
            changeType="positive"
            icon={DollarSign}
            variant="revenue"
          />
        </div>

        {/* User Growth + Fleet Status */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <UserGrowthChart />
          </div>
          <div>
            <FleetStatusChart />
          </div>
        </div>

        {/* Booking Performance + Revenue Target */}
        <div className="grid grid-cols-2 gap-4">
          <BookingPerformanceChart />
          <RevenueTargetChart />
        </div>

        {/* Top Performers + Transactions */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <TopPerformers />
          </div>
          <div className="col-span-3">
            <RecentTransactions />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D3778] hover:bg-[#0A2855] text-white rounded-lg font-medium"
          >
            <Download className="h-4 w-4" />
            Download Full Report
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default AdminReport;


