//customer
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Calendar,
  User,
  Clock,
  Car,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  X,
  CreditCard,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchUserDetails,
  fetchAndEnrichCustomerBookings,
  formatBookingDate,
  formatCurrency,
  getVehicleImageUrl,
  handleLogout,
} from '../../services/bookingHistoryService';
import VehicleBookingModal from './VehicleBookingModal';
import AppLayout from '../../components/layout/Layout'; 

const { width } = Dimensions.get('window');

const BookingHistory = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(1);

  // Modal state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

  // Fetch user authentication
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) {
          console.log('No token found');
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const userResponse = await fetchUserDetails(API_BASE_URL, API_VERSION);

        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user);
          setRole(userResponse.user.role ?? 1);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUser(null);
        setRole(1);
        setIsAuthenticated(false);
      }
    };

    getUserDetails();
  }, [API_BASE_URL, API_VERSION]);

  // Fetch bookings when user is available
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const bookingsResponse = await fetchAndEnrichCustomerBookings(
          user._id,
          API_BASE_URL,
          API_VERSION,
        );

        if (bookingsResponse.success) {
          setBookings(bookingsResponse.data || []);
        } else {
          console.error('Failed to fetch bookings:', bookingsResponse.message);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, user?._id, API_BASE_URL, API_VERSION]);

  // Handle logout
  const onLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await handleLogout(API_BASE_URL, API_VERSION);
            await AsyncStorage.multiRemove([
              'userToken',
              'userId',
              'userRole',
              'userStatus',
            ]);
            setUser(null);
            setRole(1);
            setIsAuthenticated(false);
            router.replace('/login');
          } catch (error) {
            console.error('Logout failed', error);
          }
        },
      },
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (isAuthenticated && user?._id) {
      const refreshBookings = async () => {
        try {
          const bookingsResponse = await fetchAndEnrichCustomerBookings(
            user._id,
            API_BASE_URL,
            API_VERSION,
          );
          if (bookingsResponse.success) {
            setBookings(bookingsResponse.data || []);
          }
        } catch (error) {
          console.error('Error refreshing bookings:', error);
        } finally {
          setRefreshing(false);
        }
      };
      refreshBookings();
    } else {
      setRefreshing(false);
    }
  }, [isAuthenticated, user?._id, API_BASE_URL, API_VERSION]);

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
      case 'approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircle,
        };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
    }
  };

  const getStatusText = (status) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : 'Unknown';
  };

  const StarRating = ({ rating = 0, size = 'sm', showNumber = true }) => {
    const starSize = size === 'sm' ? 12 : 16;

    if (!rating || rating === 0) {
      return (
        <View className="flex-row items-center">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={starSize} color="#D1D5DB" />
          ))}
          {showNumber && (
            <Text className="text-xs font-medium text-gray-400 ml-1">
              No ratings
            </Text>
          )}
        </View>
      );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <View className="flex-row items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={starSize}
            color={index < fullStars ? '#FBBF24' : '#D1D5DB'}
            fill={index < fullStars ? '#FBBF24' : 'transparent'}
          />
        ))}
        {showNumber && (
          <Text className="text-xs font-medium text-gray-700 ml-1">
            {rating.toFixed(1)}
          </Text>
        )}
      </View>
    );
  };

  const handleViewDetails = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setSelectedBookingId(bookingId);
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBookingId(null);
    setSelectedBooking(null);
  };

  //  pay button handler 
  const handlePayPress = (booking) => {
    // Only allow payment for approved bookings
    if (booking.status?.toLowerCase() !== 'approved') {
      Alert.alert(
        'Payment Not Available',
        'You can only pay for approved bookings.',
      );
      return;
    }
    
    //  alert 
    Alert.alert(
      'Payment',
      `Payment for ${formatCurrency(booking.totalAmount, 'LKR')} will be implemented soon.`,
      [{ text: 'OK' }]
    );
  };

  // Mobile booking card
  const MobileBookingCard = ({ booking }) => {
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;
    
    // Check for deleted vehicle
    const isVehicleDeleted =
      !booking.vehicleDetails ||
      booking.vehicleDetails === null ||
      (typeof booking.vehicleDetails === 'object' && Object.keys(booking.vehicleDetails).length === 0) ||
      booking.vehicleDetails?.isDeleted === true ||
      booking.vehicleDetails?.title === 'Unknown Vehicle';

    // Check if payment is allowed
    const canPay = booking.status?.toLowerCase() === 'approved' && !isVehicleDeleted;
    
    const imageUrl = !isVehicleDeleted && booking.vehicleDetails ? getVehicleImageUrl(
      booking.vehicleDetails,
      0,
      API_BASE_URL,
    ) : null;

    return (
      <View className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Image and Status */}
        <View className="relative h-48">
          {isVehicleDeleted ? (
            <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <Car size={48} color="#9CA3AF" />
              <Text className="text-sm font-medium text-gray-500 mt-2">
                This vehicle has been deleted
              </Text>
            </View>
          ) : imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
              <Car size={48} color="#9CA3AF" />
            </View>
          )}

          {/* Status Badge */}
          <View className="absolute top-2 left-2">
            <View
              className={`flex-row items-center px-2 py-1 rounded-full ${statusStyle.bg}`}
            >
              <StatusIcon
                size={12}
                color={statusStyle.text.includes('800') ? '#000' : '#fff'}
              />
              <Text
                className={`text-xs font-semibold ml-1 ${statusStyle.text}`}
              >
                {getStatusText(booking.status)}
              </Text>
            </View>
          </View>

          {/* Stars or Deleted Indicator */}
          <View className="absolute top-2 right-2">
            {isVehicleDeleted ? (
              <View className="bg-red-100 px-2 py-1 rounded">
                <Text className="text-xs text-red-600 font-medium">
                  Vehicle Deleted
                </Text>
              </View>
            ) : (
              <View className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                <StarRating
                  rating={booking.vehicleDetails?.rating}
                  size="sm"
                  showNumber={true}
                />
              </View>
            )}
          </View>

          {/* Days badge */}
          <View className="absolute bottom-2 right-2">
            <View className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
              <Text className="text-xs text-white">
                {booking.days} day{booking.days !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          {/* Vehicle Title and Price */}
          <View className="flex-row justify-between items-start mb-2">
            <Text
              className={`font-bold text-base flex-1 pr-2 ${
                isVehicleDeleted ? 'text-gray-400' : 'text-[#0D3778]'
              }`}
              numberOfLines={2}
            >
              {isVehicleDeleted ? 'This vehicle has been deleted' : (booking.vehicleDetails?.title || 'Unknown Vehicle')}
            </Text>
            <Text className={`text-base font-bold ${
              isVehicleDeleted ? 'text-gray-400' : 'text-[#0D3778]'
            }`}>
              {formatCurrency(booking.totalAmount, 'LKR')}
            </Text>
          </View>

          {/* Date Info */}
          <View className="space-y-2 mb-3">
            {/* Pickup Date */}
            <View className="flex-row items-start">
              <Calendar
                size={14}
                color="#2563EB"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Pickup</Text>
                <Text className="text-xs font-medium" numberOfLines={1}>
                  {formatBookingDate(booking.startingDate)}
                </Text>
              </View>
            </View>

            {/* Owner Information */}
            <View className="flex-row items-start">
              <User
                size={14}
                color={isVehicleDeleted ? "#9CA3AF" : "#9333EA"}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Owner</Text>
                <Text className={`text-xs font-medium ${
                  isVehicleDeleted ? 'text-gray-400' : ''
                }`} numberOfLines={1}>
                  {isVehicleDeleted ? 'Vehicle owner unavailable' : booking.ownerName}
                </Text>
              </View>
            </View>

            {/* Drop-off Date */}
            <View className="flex-row items-start">
              <Calendar
                size={14}
                color="#16A34A"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Drop-off</Text>
                <Text className="text-xs font-medium" numberOfLines={1}>
                  {formatBookingDate(booking.endDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Actions */}
          <View className="flex-row justify-end items-center pt-2 border-t border-gray-100 space-x-2">
            {/* Pay Button  */}
            <TouchableOpacity
              onPress={() => handlePayPress(booking)}
              disabled={!canPay}
              className={`flex-row items-center px-4 py-2 rounded-lg ${
                canPay ? 'bg-[#0D3778]' : 'bg-gray-300'
              }`}
            >
              <CreditCard size={14} color={canPay ? '#FFFFFF' : '#9CA3AF'} />
              <Text
                className={`text-xs font-semibold ml-1 ${
                  canPay ? 'text-white' : 'text-gray-500'
                }`}
              >
                Pay
              </Text>
            </TouchableOpacity>

            {/* View Details Button */}
            <TouchableOpacity
              onPress={() => !isVehicleDeleted && handleViewDetails(booking._id)}
              disabled={isVehicleDeleted}
              className={`flex-row items-center px-4 py-2 rounded-lg ${
                isVehicleDeleted ? 'bg-gray-300' : 'bg-[#0D3778]'
              }`}
            >
              <Text
                className={`text-xs font-semibold mr-1 ${
                  isVehicleDeleted ? 'text-gray-500' : 'text-white'
                }`}
              >
                {isVehicleDeleted ? 'Unavailable' : 'Details'}
              </Text>
              {!isVehicleDeleted && <ChevronRight size={14} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Desktop booking card
  const DesktopBookingCard = ({ booking }) => {
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;
    
    // Check for deleted vehicle
    const isVehicleDeleted =
      !booking.vehicleDetails ||
      booking.vehicleDetails === null ||
      (typeof booking.vehicleDetails === 'object' && Object.keys(booking.vehicleDetails).length === 0) ||
      booking.vehicleDetails?.isDeleted === true ||
      booking.vehicleDetails?.title === 'Unknown Vehicle';

    // Check if payment is allowed 
    const canPay = booking.status?.toLowerCase() === 'approved' && !isVehicleDeleted;
    
    const imageUrl = !isVehicleDeleted && booking.vehicleDetails ? getVehicleImageUrl(
      booking.vehicleDetails,
      0,
      API_BASE_URL,
    ) : null;

    return (
      <View className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
        <View className="flex-row h-64">
          {/* Image container */}
          <View className="w-80 h-full relative">
            {isVehicleDeleted ? (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <Car size={40} color="#9CA3AF" />
                <Text className="text-sm font-medium text-gray-500 mt-2">
                  This vehicle has been deleted
                </Text>
              </View>
            ) : imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center">
                <Car size={40} color="#9CA3AF" />
                <Text className="text-sm font-medium text-gray-400 mt-2">
                  No Image
                </Text>
              </View>
            )}
          </View>

          {/* Content area */}
          <View className="flex-1 p-4 flex-col">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text
                    className={`text-lg font-bold flex-1 ${
                      isVehicleDeleted ? 'text-gray-400' : 'text-[#0D3778]'
                    }`}
                    numberOfLines={2}
                  >
                    {isVehicleDeleted ? 'This vehicle has been deleted' : (booking.vehicleDetails?.title || 'Unknown Vehicle')}
                  </Text>
                  <View
                    className={`flex-row items-center px-2 py-0.5 rounded-full ${statusStyle.bg}`}
                  >
                    <StatusIcon
                      size={12}
                      color={statusStyle.text.includes('800') ? '#000' : '#fff'}
                    />
                    <Text
                      className={`text-xs font-semibold ml-1 ${statusStyle.text}`}
                    >
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="items-end">
                <View className="flex-row items-center mb-0.5">
                  {isVehicleDeleted ? (
                    <View className="bg-gray-100 px-2 py-1 rounded">
                      <Text className="text-xs text-gray-500">Unavailable</Text>
                    </View>
                  ) : (
                    <StarRating
                      rating={booking.vehicleDetails?.rating}
                      size="sm"
                      showNumber={true}
                    />
                  )}
                </View>
                <Text className={`text-xl font-bold ${
                  isVehicleDeleted ? 'text-gray-400' : 'text-[#0D3778]'
                }`}>
                  {formatCurrency(booking.totalAmount, 'LKR')}
                </Text>
                <Text className="text-xs text-gray-500">
                  {booking.days} day{booking.days !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-4 mb-3 flex-1">
              {/* Pickup Date */}
              <View className="flex-1">
                <View className="flex-row items-start">
                  <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
                    <Calendar size={16} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500">Pickup</Text>
                    <Text className="text-sm font-medium" numberOfLines={1}>
                      {formatBookingDate(booking.startingDate)}
                    </Text>
                  </View>
                </View>

                {/* Owner information */}
                <View className="flex-row items-start mt-3">
                  <View className={`p-1.5 rounded-lg mr-2 ${
                    isVehicleDeleted ? 'bg-gray-100' : 'bg-purple-50'
                  }`}>
                    <User size={16} color={isVehicleDeleted ? "#9CA3AF" : "#9333EA"} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500">Owner</Text>
                    <Text className={`text-sm font-medium ${
                      isVehicleDeleted ? 'text-gray-400' : ''
                    }`} numberOfLines={1}>
                      {isVehicleDeleted ? 'Vehicle owner unavailable' : booking.ownerName}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Drop-off Date */}
              <View className="flex-1">
                <View className="flex-row items-start">
                  <View className="bg-green-50 p-1.5 rounded-lg mr-2">
                    <Calendar size={16} color="#16A34A" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500">Drop-off</Text>
                    <Text className="text-sm font-medium" numberOfLines={1}>
                      {formatBookingDate(booking.endDate)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Actions */}
            <View className="flex-row justify-end items-center pt-3 border-t border-gray-100 space-x-3">
              {/* Pay Button  */}
              <TouchableOpacity
                onPress={() => handlePayPress(booking)}
                disabled={!canPay}
                className={`px-6 py-2 rounded-lg flex-row items-center ${
                  canPay ? 'bg-[#0D3778]' : 'bg-gray-300'
                }`}
              >
                <CreditCard size={16} color={canPay ? '#FFFFFF' : '#9CA3AF'} />
                <Text
                  className={`text-sm font-semibold ml-2 ${
                    canPay ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  Pay
                </Text>
              </TouchableOpacity>

              {/* View Details Button */}
              <TouchableOpacity
                onPress={() => !isVehicleDeleted && handleViewDetails(booking._id)}
                disabled={isVehicleDeleted}
                className={`px-6 py-2 rounded-lg ${
                  isVehicleDeleted ? 'bg-gray-300' : 'bg-[#0D3778]'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isVehicleDeleted ? 'text-gray-500' : 'text-white'
                  }`}
                >
                  {isVehicleDeleted ? 'Unavailable' : 'Details'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <AppLayout>
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0D3778" />
            <Text className="mt-4 text-gray-600">Loading bookings...</Text>
          </View>
        </AppLayout>
      </SafeAreaView>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <AppLayout>
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-4xl mb-4">🔒</Text>
            <Text className="text-xl font-bold text-gray-800 mb-3">
              Authentication Required
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/login')}
              className="px-6 py-3 bg-[#0D3778] rounded-lg"
            >
              <Text className="text-white font-medium">Sign In</Text>
            </TouchableOpacity>
          </View>
        </AppLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <AppLayout>
        <ScrollView
          className="flex-1 bg-gray-50"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0D3778']}
            />
          }
        >
          <View className="p-4">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                Your Vehicle Booking History
              </Text>
              <Text className="text-gray-600 mt-1">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
              </Text>
            </View>

            {/* Bookings List */}
            {bookings.length === 0 ? (
              <View className="bg-white rounded-xl p-6 items-center border border-gray-200">
                <Text className="text-4xl mb-4">🚗</Text>
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  No Bookings Yet
                </Text>
                <Text className="text-gray-600 mb-6 text-center">
                  You havent booked any vehicles yet.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/vehicles')}
                  className="px-6 py-3 bg-[#0D3778] rounded-lg"
                >
                  <Text className="text-white font-medium">
                    Browse Available Vehicles
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {bookings.map((booking) => (
                  <View key={booking._id}>
                    {/* Mobile View */}
                    <View className="block md:hidden">
                      <MobileBookingCard booking={booking} />
                    </View>
                    {/* Desktop View */}
                    <View className="hidden md:block">
                      <DesktopBookingCard booking={booking} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Modal for viewing booking details */}
        {showModal && selectedBookingId && (
          <VehicleBookingModal
            bookingId={selectedBookingId}
            booking={selectedBooking}
            onClose={handleCloseModal}
            API_BASE_URL={API_BASE_URL}
            API_VERSION={API_VERSION}
          />
        )}
      </AppLayout>
    </SafeAreaView>
  );
};

export default BookingHistory;