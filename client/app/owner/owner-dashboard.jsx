import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { Car, Calendar, DollarSign, Star, X } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getRawOwnerBookings, getOwnerEarnings, getMyVehicleListings, getMyVehicleReviews, api } from '../../services/ownerApi';

import { useRouter } from 'expo-router';

// --- Components ---

const MetricCard = ({ title, value, icon: Icon, colorClass, iconColorClass }) => (
  <View className={`rounded-xl p-4 flex-col justify-between h-32 ${colorClass}`}>
    <View className="flex-row justify-between items-start">
      <View>
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</Text>
        <Text className="mt-2 text-2xl font-bold text-gray-900">{value}</Text>
      </View>
      <View className="p-2 rounded-lg bg-white">
        <Icon size={20} color={iconColorClass} />
      </View>
    </View>
  </View>
);

const EarningsChart = ({ data = [] }) => {
  const screenWidth = Dimensions.get("window").width;
  
  const chartData = {
    labels: data.length > 0 ? data.map(d => d.name) : [''],
    datasets: [
      {
        data: data.length > 0 ? data.map(d => d.value) : [0],
        color: (opacity = 1) => `rgba(13, 55, 120, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-800">Monthly Earnings</Text>
        <Text className="text-sm text-gray-500">Your earnings over time</Text>
      </View>
      {data.length === 0 ? (
        <View className="h-48 items-center justify-center">
          <Text className="text-gray-400 text-sm">No earnings data available</Text>
        </View>
      ) : (
        <LineChart
          data={chartData}
          width={screenWidth - 64} // padding සඳහා
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(13, 55, 120, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#0D3778"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      )}
    </View>
  );
};

const BookingStatusCard = ({ approved = 0, pending = 0, rejected = 0 }) => {
  const statuses = [
    { label: 'Approved', count: approved, color: 'bg-green-50', textColor: 'text-green-600', dot: 'bg-green-500' },
    { label: 'Pending', count: pending, color: 'bg-orange-50', textColor: 'text-orange-600', dot: 'bg-orange-500' },
    { label: 'Rejected', count: rejected, color: 'bg-red-50', textColor: 'text-red-600', dot: 'bg-red-500' },
  ];

  return (
    <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4">
      <Text className="text-lg font-semibold text-gray-800 mb-4">Booking Status</Text>
      <View className="flex-col gap-3">
        {statuses.map((status) => (
          <View key={status.label} className={`flex-row items-center justify-between p-4 rounded-lg ${status.color}`}>
            <View className="flex-row items-center gap-3">
              <View className={`w-2 h-2 rounded-full ${status.dot}`}></View>
              <Text className={`font-medium text-sm ${status.textColor}`}>{status.label}</Text>
            </View>
            <Text className={`font-bold ${status.textColor}`}>{status.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const RecentBookingsTable = ({ bookings = [], onViewBooking }) => {
    const getStatusStyle = (status) => {
        switch(status) {
            case 'pending': return { bg: 'bg-orange-100', text: 'text-orange-600' };
            case 'approved': return { bg: 'bg-green-100', text: 'text-green-600' };
            case 'rejected': return { bg: 'bg-red-100', text: 'text-red-600' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
        }
    };

    const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    const formatDates = (start, end) => {
        const s = start ? new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
        const e = end ? new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
        return s && e ? `${s} – ${e}` : s || e || '-';
    };

    return (
        <View className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
            <View className="p-4 pb-2">
                <Text className="text-lg font-semibold text-gray-800">Recent Bookings</Text>
                <Text className="text-sm text-gray-500">Manage your recent vehicle bookings</Text>
            </View>

            {bookings.length === 0 ? (
                <View className="p-6 items-center">
                    <Text className="text-gray-400 text-sm">No bookings found</Text>
                </View>
            ) : (
                <View className="flex-col gap-4 p-4 pt-0">
                    {bookings.map((booking) => {
                        const vehicleName = booking.vehicleId?.title || booking.vehicleId?.model || 'N/A';
                        const customerName = booking.customerId
                            ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim()
                            : 'N/A';
                        
                        const statusStyle = getStatusStyle(booking.status);

                        return (
                        <View key={booking._id} className="border border-gray-100 rounded-lg p-4 shadow-sm flex-col gap-3">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-8 h-8 rounded flex items-center justify-center bg-blue-100">
                                        <Car size={16} color="#2563eb" />
                                    </View>
                                    <View>
                                        <Text className="font-medium text-gray-900">{vehicleName}</Text>
                                        <Text className="text-xs text-gray-500">{customerName}</Text>
                                    </View>
                                </View>
                                <View className={`px-2 py-1 rounded-full ${statusStyle.bg}`}>
                                    <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
                                        {formatStatus(booking.status)}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row justify-between items-center mt-2">
                                <View>
                                    <Text className="text-xs text-gray-400 mb-1">Dates</Text>
                                    <Text className="font-medium text-sm text-gray-600">{formatDates(booking.startingDate, booking.endDate)}</Text>
                                </View>
                                <TouchableOpacity
                                    className="border border-gray-200 rounded px-4 py-2 bg-gray-50"
                                    onPress={() => onViewBooking(booking)}
                                >
                                    <Text className="text-xs font-medium text-gray-500">View</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

const NotificationItem = ({ item }) => (
    <TouchableOpacity className="flex-row items-start gap-4 p-4 rounded-lg">
        <View className={`p-2 rounded-lg ${item.bgColor || 'bg-gray-100'}`}>
            {item.icon ? <item.icon size={18} color={item.iconColor || "#4b5563"} /> : <Calendar size={18} color="#4b5563" />}
        </View>
        <View className="flex-1">
            <Text className="text-sm font-medium text-gray-800">{item.text || item.message}</Text>
            <Text className="text-xs text-gray-400 mt-1">{item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString() : '')}</Text>
        </View>
    </TouchableOpacity>
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
    booking.status === 'pending' ? { bg: 'bg-orange-100', text: 'text-orange-600' } :
    booking.status === 'approved' ? { bg: 'bg-green-100', text: 'text-green-600' } :
    { bg: 'bg-red-100', text: 'text-red-600' };

  return (
    <Modal transparent={true} visible={!!booking} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center p-4 bg-black/50">
        <View className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Booking Details</Text>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full">
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View className="p-6 space-y-6">
            <View className="flex-row items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <View className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Car size={24} color="#2563eb" />
              </View>
              <View>
                <Text className="font-bold text-gray-900 text-lg">{vehicleName}</Text>
                {!!vehicleType && <Text className="text-sm text-gray-500 capitalize">{vehicleType}</Text>}
              </View>
            </View>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-4 pr-2">
                <Text className="text-sm text-gray-500 mb-1">Customer</Text>
                <Text className="font-medium text-gray-900">{customerName}</Text>
              </View>
              <View className="w-1/2 mb-4 pl-2">
                <Text className="text-sm text-gray-500 mb-1">Status</Text>
                <View className={`self-start px-3 py-1 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                        {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : ''}
                    </Text>
                </View>
              </View>
              <View className="w-1/2 mb-4 pr-2">
                <Text className="text-sm text-gray-500 mb-1">Dates</Text>
                <Text className="font-medium text-gray-900">{dates}</Text>
              </View>
              <View className="w-1/2 mb-4 pl-2">
                <Text className="text-sm text-gray-500 mb-1">Location</Text>
                <Text className="font-medium text-gray-900">{location}</Text>
              </View>
              <View className="w-full pt-4 border-t border-gray-100 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-500">Total Price</Text>
                  <Text className="text-xl font-bold text-gray-900">Rs. {booking.totalAmount?.toLocaleString() || '0'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="p-6 bg-gray-50 border-t border-gray-100 flex-row justify-end">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
              <Text className="text-sm font-medium text-gray-700">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OwnerDashboard = () => {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data state
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [earningsData, setEarningsData] = useState({ totalEarnings: 0, totalBookings: 0 });
  const [monthlyEarningsChart, setMonthlyEarningsChart] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          // User is not logged in, redirect to login page
          router.replace('/login/SignInPage');
          return false;
        }
        setIsLoggedIn(true);
        return true;
      } catch (error) {
        console.error('Error checking login status:', error);
        router.replace('/login/SignInPage');
        return false;
      }
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const isUserLoggedIn = await checkLoginStatus();
        if (!isUserLoggedIn) return;

        const userStr = await AsyncStorage.getItem('user');
        const user = (userStr && userStr !== 'undefined' && userStr !== 'null') ? JSON.parse(userStr) : {};
        const ownerId = user._id || user.id;

        console.log('Fetching dashboard data for owner:', ownerId);

        // Fetch bookings - using raw bookings
        const bookingsRes = await getRawOwnerBookings().catch(err => {
          console.error('Bookings fetch error:', err);
          return { data: [] };
        });
        const allBookings = bookingsRes?.data || [];
        console.log('Fetched bookings:', allBookings.length);
        setBookings(allBookings);

        // Fetch vehicles
        const vehiclesRes = await getMyVehicleListings().catch(err => {
          console.error('Vehicles fetch error:', err);
          return { vehicles: [] };
        });
        const allVehicles = vehiclesRes?.vehicles || vehiclesRes?.data || [];
        console.log('Fetched vehicles:', allVehicles.length);
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
        console.log('Monthly chart data:', sortedChart);
        setMonthlyEarningsChart(sortedChart);
        
        const approvedCount = allBookings.filter(b => b.status === 'approved').length;
        console.log('Total earnings:', totalFromBookings, 'Approved bookings:', approvedCount);
        setEarningsData({ totalEarnings: totalFromBookings, totalBookings: approvedCount });

        // Fetch reviews for average rating
        const reviewsRes = await getMyVehicleReviews().catch(err => {
          console.error('Reviews fetch error:', err);
          return null;
        });
        console.log('Reviews response:', reviewsRes);
        if (reviewsRes?.vehicleStats?.length) {
          const totalRating = reviewsRes.vehicleStats.reduce((sum, v) => sum + v.averageRating, 0);
          const avgRatingValue = (totalRating / reviewsRes.vehicleStats.length).toFixed(1);
          console.log('Average rating:', avgRatingValue);
          setAvgRating(avgRatingValue);
        }

        // Fetch notifications
        const notifRes = await api.get('/notification/me').catch(err => {
          console.error('Notifications fetch error:', err);
          return { data: { data: [] } };
        });
        const notifData = notifRes?.data?.data || [];
        console.log('Fetched notifications:', notifData.length);
        setNotifications(notifData.slice(0, 5));

      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  if (loading || !isLoggedIn) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0D3778" />
        <Text className="text-gray-500 text-sm mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  const recentBookings = bookings.slice(0, 5);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Metric Cards */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] mb-4">
            <MetricCard
              title="Total Vehicles"
              value={vehicles.length}
              icon={Car}
              colorClass="bg-blue-50"
              iconColorClass="#2563eb"
            />
          </View>
          <View className="w-[48%] mb-4">
            <MetricCard
              title="Active Bookings"
              value={activeBookings}
              icon={Calendar}
              colorClass="bg-green-50"
              iconColorClass="#16a34a"
            />
          </View>
          <View className="w-[48%] mb-4">
            <MetricCard
              title="Total Earnings"
              value={formatEarnings(earningsData.totalEarnings)}
              icon={DollarSign}
              colorClass="bg-purple-50"
              iconColorClass="#9333ea"
            />
          </View>
          <View className="w-[48%] mb-4">
            <MetricCard
              title="Average Rating"
              value={avgRating || 'N/A'}
              icon={Star}
              colorClass="bg-yellow-50"
              iconColorClass="#ca8a04"
            />
          </View>
        </View>

        {/* Charts Section */}
        <EarningsChart data={monthlyEarningsChart} />
        <BookingStatusCard
          approved={activeBookings}
          pending={pendingBookings}
          rejected={rejectedBookings}
        />

        {/* Recent Bookings */}
        <RecentBookingsTable bookings={recentBookings} onViewBooking={handleViewBooking} />

        {/* Notifications */}
        <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
            <View className="mb-4">
                <Text className="text-lg font-semibold text-gray-800">Recent Notifications</Text>
            </View>
            <View className="flex-col gap-1">
                {notifications.length === 0 ? (
                    <Text className="text-sm text-gray-400 text-center py-4">No notifications</Text>
                ) : (
                    notifications.map(item => (
                        <NotificationItem key={item._id} item={{
                            ...item,
                            text: item.message,
                            bgColor: 'bg-blue-100',
                            iconColor: '#3b82f6',
                            icon: Calendar,
                        }} />
                    ))
                )}
            </View>
        </View>
      </ScrollView>

      {/* Booking Details Popup */}
      {selectedBooking && (
        <BookingPopup booking={selectedBooking} onClose={closePopup} />
      )}
    </View>
  );
};

export default OwnerDashboard;