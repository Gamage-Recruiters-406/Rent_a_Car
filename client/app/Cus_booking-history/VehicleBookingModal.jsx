//customer
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar,
  User,
  Phone,
  Star,
  X,
  MessageSquare,
  Car,
} from 'lucide-react-native';
import {
  getEnrichedBooking,
  enrichBookingData,
  formatCurrency,
  getVehicleImageUrl,
} from '../../services/bookingHistoryService';

const VehicleBookingModal = ({
  bookingId,
  booking: initialBooking,
  onClose,
  API_BASE_URL,
  API_VERSION,
}) => {
  const navigation = useNavigation();
  const [booking, setBooking] = useState(initialBooking || null);
  const [loading, setLoading] = useState(!initialBooking);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (initialBooking) {
      const enrichExistingBooking = async () => {
        try {
          const enriched = await enrichBookingData(
            initialBooking,
            API_BASE_URL,
            API_VERSION,
          );
          setBooking(enriched);
        } catch (err) {
          console.error('Error enriching existing booking:', err);
          setBooking(initialBooking);
        }
      };

      enrichExistingBooking();
      return;
    }

    if (!bookingId) return;

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const enrichedBooking = await getEnrichedBooking(
          bookingId,
          API_BASE_URL,
          API_VERSION,
        );
        setBooking(enrichedBooking);
      } catch (err) {
        console.error('Error fetching booking details:', err);

        if (
          err.message?.includes('404') ||
          err.message?.includes('not found')
        ) {
          setError('Booking not found. It may have been deleted.');
        } else if (
          err.message?.includes('403') ||
          err.message?.includes('permission')
        ) {
          setError(
            'Access denied. You do not have permission to view this booking.',
          );
        } else if (
          err.message?.includes('401') ||
          err.message?.includes('sign in')
        ) {
          setError('Please sign in to view booking details.');
        } else if (err.message?.includes('Network error')) {
          setError('Network error. Please check your connection.');
        } else {
          setError(
            err.message || 'Error loading booking details. Please try again.',
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, API_BASE_URL, API_VERSION, initialBooking]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' };
      case 'approved':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          label: 'Approved',
        };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    }
  };

  const handleCallOwner = () => {
    if (booking?.ownerContact && booking.ownerContact !== 'N/A') {
      Linking.openURL(`tel:${booking.ownerContact}`);
    }
  };

  const handleAddReview = () => {
    if (!booking?.vehicleId) return;

    // Close the modal first
    onClose();

    // Small delay to ensure modal is closed before navigation
    setTimeout(() => {
      try {
        const vehicleId = booking.vehicleId._id || booking.vehicleId;
        const vehicleName = booking.vehicleDetails?.title || 'Vehicle';
        const vehicleImage = getVehicleImageUrl(
          booking.vehicleDetails,
          0,
          API_BASE_URL,
        );

        // Navigate to CustomerReviews screen with params
        navigation.navigate('Reviews', {
          vehicleId: vehicleId,
          vehicleName: vehicleName,
          vehicleImage: vehicleImage,
          bookingId: booking._id,
        });
      } catch (navError) {
        console.error('Navigation error:', navError);
        //  Show an error message to the user
      }
    }, 100);
  };

  const StarRating = ({ rating = 0, reviewCount = 0, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = size === 'sm' ? 16 : 20;
    const textSize = size === 'sm' ? 'text-sm' : 'text-2xl';

    return (
      <View className="flex-row items-center flex-wrap gap-2">
        <Text className={`font-bold text-gray-900 ${textSize}`}>
          {rating.toFixed(1)}
        </Text>
        <View className="flex-row items-center">
          {[...Array(5)].map((_, index) => {
            let starColor = '#D1D5DB';
            let fillColor = 'transparent';

            if (index < fullStars) {
              starColor = '#FBBF24';
              fillColor = '#FBBF24';
            } else if (index === fullStars && hasHalfStar) {
              starColor = '#FBBF24';
              fillColor = '#FCD34D';
            }

            return (
              <Star
                key={index}
                size={starSize}
                color={starColor}
                fill={fillColor}
              />
            );
          })}
        </View>
        <Text className="text-sm text-gray-500">{reviewCount} reviews</Text>
      </View>
    );
  };

  // Loading State
  if (loading) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center justify-center w-4/5 max-w-md">
            <ActivityIndicator size="large" color="#0D3778" />
            <Text className="mt-4 text-base text-gray-500">
              Loading booking details...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Error State
  if (error || !booking) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-8 rounded-2xl items-center justify-center w-4/5 max-w-md">
            <Text className="text-5xl mb-4">⚠️</Text>
            <Text className="text-xl font-bold text-gray-900 mb-2">Error</Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
              {error || 'Booking not found'}
            </Text>
            <TouchableOpacity
              className="bg-[#0D3778] px-6 py-3 rounded-lg"
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const statusStyle = getStatusStyles(booking.status);
  const vehicleImages =
    booking.vehicleDetails?.photos || booking.vehicleDetails?.images || [];
  const mainImage = getVehicleImageUrl(
    booking.vehicleDetails,
    selectedImageIndex,
    API_BASE_URL,
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-[95%] max-w-2xl max-h-[95%] rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-3 bg-[#0D3778]">
            <Text className="text-lg font-bold text-white">
              Booking Details
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="pb-6">
            {/* Vehicle Title and Status */}
            <View className="p-4 flex-row justify-between items-start gap-3">
              <Text
                className="flex-1 text-xl font-bold text-[#0D3778]"
                numberOfLines={2}
              >
                {booking.vehicleDetails?.year} {booking.vehicleDetails?.title}
              </Text>
              <View className={`px-3 py-1.5 rounded-full ${statusStyle.bg}`}>
                <Text className={`text-xs font-semibold ${statusStyle.text}`}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            {/* Vehicle Images */}
            <View className="px-4 mb-4">
              <View className="bg-gray-100 rounded-xl overflow-hidden h-64 mb-3">
                {mainImage ? (
                  <Image
                    source={{ uri: mainImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full justify-center items-center bg-gray-100">
                    <Car size={48} color="#9CA3AF" />
                    <Text className="mt-2 text-sm text-gray-400">
                      No Image Available
                    </Text>
                  </View>
                )}
              </View>

              {/* Thumbnail Images */}
              {vehicleImages.length > 1 && (
                <FlatList
                  horizontal
                  data={vehicleImages.slice(0, 4)}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => {
                    const thumbUrl = typeof item === 'object' ? item.url : item;
                    const fullThumbUrl = thumbUrl?.startsWith('http')
                      ? thumbUrl
                      : `${API_BASE_URL}${thumbUrl}`;

                    return (
                      <TouchableOpacity
                        onPress={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 mr-2 ${
                          selectedImageIndex === index
                            ? 'border-[#0D3778]'
                            : 'border-gray-200'
                        }`}
                      >
                        <Image
                          source={{ uri: fullThumbUrl }}
                          className="w-full h-full"
                        />
                      </TouchableOpacity>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>

            {/* Booking Details Section */}
            <View className="bg-gray-50 p-4 mx-4 mb-4 rounded-xl">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Your Booking Details:
              </Text>

              {/* Total Amount */}
              <View className="items-end mb-3">
                <Text className="text-xs text-gray-500">Total Amount</Text>
                <Text className="text-2xl font-bold text-[#0D3778]">
                  {formatCurrency(booking.totalAmount, 'LKR')}
                </Text>
              </View>

              {/* Date Range */}
              <View className="flex-row items-center bg-white px-3 py-2.5 rounded-lg border border-gray-200">
                <Calendar
                  size={20}
                  color="#9CA3AF"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-sm font-medium text-gray-800 flex-1">
                  {formatDate(booking.startingDate)} -{' '}
                  {formatDate(booking.endDate)}
                </Text>
              </View>
            </View>

            {/* Vehicle Specifications */}
            <View className="bg-white p-4 mx-4 mb-4 rounded-xl border border-gray-200">
              <Text className="text-base font-bold text-gray-900 mb-3">
                Specifications
              </Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Number Plate</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.numberPlate || 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Vehicle Type</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.vehicleType || 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Fuel Type</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.fuelType || 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Transmission</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.transmission || 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Year</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.year || 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Current KM</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {booking.vehicleDetails?.km?.toLocaleString() || '0'} km
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Price per KM</Text>
                  <Text className="text-xs font-medium text-gray-900 text-right flex-1 ml-4">
                    {formatCurrency(booking.vehicleDetails?.pricePerKm, 'LKR')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Owner Contact */}
            <View className="bg-white p-4 mx-4 mb-4 rounded-xl border border-gray-200">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
                  <User size={24} color="#4B5563" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {booking.ownerName}
                  </Text>
                  <Text className="text-sm text-gray-500">Owner</Text>
                </View>
              </View>
              <TouchableOpacity
                className={`flex-row items-center justify-center gap-2 py-3 px-4 rounded-lg ${
                  booking.ownerContact && booking.ownerContact !== 'N/A'
                    ? 'bg-[#0D3778]'
                    : 'bg-gray-300'
                }`}
                onPress={handleCallOwner}
                disabled={
                  !booking.ownerContact || booking.ownerContact === 'N/A'
                }
                activeOpacity={0.8}
              >
                <Phone size={16} color="#FFFFFF" />
                <Text className="text-white text-sm font-medium">
                  Call {booking.ownerContact || 'N/A'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reviews Section */}
            <View className="bg-white p-4 mx-4 mb-6 rounded-xl border border-gray-200">
              <Text className="text-base font-bold text-gray-900 mb-3">
                We'd love your feedback
              </Text>

              <View className="mb-4">
                <StarRating
                  rating={booking.vehicleDetails?.rating || 0}
                  reviewCount={booking.vehicleDetails?.reviewCount || 0}
                  size="md"
                />
              </View>

              <TouchableOpacity
                className="flex-row items-center justify-center bg-white py-3.5 px-4 rounded-lg border-2 border-[#0D3778]"
                onPress={handleAddReview}
                activeOpacity={0.8}
              >
                <MessageSquare
                  size={16}
                  color="#0D3778"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-[#0D3778] text-sm font-semibold">
                  Add a Review
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default VehicleBookingModal;
