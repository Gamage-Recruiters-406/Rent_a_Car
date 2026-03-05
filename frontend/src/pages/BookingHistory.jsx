import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layouts/Layout';
import VehicleBookingModal from './VehicleBookingModal';
import {
  Calendar,
  User,
  Clock,
  Car,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchUserDetails,
  fetchAndEnrichCustomerBookings,
  formatBookingDate,
  formatCurrency,
  getVehicleImageUrl,
} from '../services/bookingHistoryService';
import PaymentPage from './payment/paymentPage';
import Modal from '../layouts/Modal';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modal state
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_VERSION = import.meta.env.VITE_API_VERSION || '';

  // Fetch user authentication
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userResponse = await fetchUserDetails(API_BASE_URL, API_VERSION);

        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    getUserDetails();
  }, [API_BASE_URL, API_VERSION]);

  // Define fetchBookings with useCallback to prevent infinite re-renders
  const fetchBookings = useCallback(async () => {
    try {
      const userId = user?.userid || user?._id;

      if (!userId) {
        console.error('User ID not found');
        setBookings([]);
        setLoading(false);
        return;
      }

      const bookingsResponse = await fetchAndEnrichCustomerBookings(
        userId,
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
  }, [user, API_BASE_URL, API_VERSION]);

  // Fetch bookings only when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
    } else if (user === null) {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchBookings]);

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
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
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if vehicle is available (not deleted)
  const isVehicleAvailable = (vehicleDetails) => {
    return vehicleDetails && vehicleDetails.title !== 'Unknown Vehicle' && vehicleDetails.title !== 'Vehicle No Longer Available';
  };

  // Star rating component
  const StarRating = ({ rating = 0, size = 'sm', showNumber = true }) => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    // If rating is 0, show empty stars
    if (!rating || rating === 0) {
      return (
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, index) => (
            <Star key={index} className={`${starSize} text-gray-300`} />
          ))}
          {showNumber && (
            <span
              className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-gray-400 ml-1`}
            >
              No ratings
            </span>
          )}
        </div>
      );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`${starSize} ${
              index < fullStars
                ? 'text-yellow-400 fill-yellow-400'
                : index === fullStars && hasHalfStar
                  ? 'text-yellow-400 fill-yellow-400/50'
                  : 'text-gray-300'
            }`}
          />
        ))}
        {showNumber && (
          <span
            className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-gray-700 ml-1`}
          >
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  };

  // handleViewDetails to open modal
  const handleViewDetails = (bookingId) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setSelectedBookingId(bookingId);
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBookingId(null);
    setSelectedBooking(null);
  };

  // Mobile booking card
  const MobileBookingCard = ({ booking }) => {
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;
    const vehicleAvailable = isVehicleAvailable(booking.vehicleDetails);
    const imageUrl = vehicleAvailable ? getVehicleImageUrl(
      booking.vehicleDetails,
      0,
      API_BASE_URL,
    ) : null;

    const [open, setOpen] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Image and Status  */}
        <div className="relative h-48">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={booking.vehicleDetails.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              {!vehicleAvailable ? (
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-red-600">Vehicle No Longer Available</p>
                </div>
              ) : (
                <Car className="h-12 w-12 text-gray-400" />
              )}
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
            >
              <StatusIcon className="h-3 w-3" />
              {getStatusText(booking.status)}
            </span>
          </div>
          {/* Stars and Price Only show if vehicle is available */}
          {vehicleAvailable && (
            <>
              <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
                {/* Stars */}
                <div className="inline-flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                  <StarRating
                    rating={booking.vehicleDetails.rating}
                    size="sm"
                    showNumber={true}
                  />
                </div>
                {/* Price */}
                <div className="inline-flex items-center gap-1 text-xs text-white bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="font-bold">
                    {formatCurrency(booking.totalAmount, 'LKR')}
                  </span>
                </div>
              </div>
              {/* Days badge */}
              <div className="absolute bottom-2 right-2">
                <span className="inline-flex items-center gap-1 text-xs text-white bg-black/70 backdrop-blur-sm px-2 py-1 rounded">
                  {booking.days} day{booking.days !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Content  */}
        <div className="p-3">
          <div className="mb-2">
            <h3 className={`font-bold text-base ${vehicleAvailable ? 'text-[#0D3778]' : 'text-gray-500'}`}>
              {vehicleAvailable ? booking.vehicleDetails.title : 'Vehicle No Longer Available'}
            </h3>
          </div>

          {/* Date Info */}
          <div className="space-y-2 mb-3">
            {/* Pickup Date */}
            <div className="flex items-start gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-xs font-medium truncate">
                  {formatBookingDate(booking.startingDate)}
                </p>
              </div>
            </div>

            {/* Owner Information  */}
            <div className="flex items-start gap-2">
              <User className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Owner</p>
                <p className="text-xs font-medium truncate">
                  {booking.ownerName}
                </p>
              </div>
            </div>

            {/* Drop-off Date */}
            <div className="flex items-start gap-2">
              <Calendar className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Drop-off</p>
                <p className="text-xs font-medium truncate">
                  {formatBookingDate(booking.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className='flex gap-3'>
              <button
                onClick={() => setOpen(true)}
                disabled={!vehicleAvailable}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  vehicleAvailable 
                    ? 'bg-[#0D3778] text-white hover:bg-[#0A2C63]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Pay
              </button>
              <button
                onClick={() => handleViewDetails(booking._id)}
                disabled={!vehicleAvailable}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  vehicleAvailable 
                    ? 'bg-[#0D3778] text-white hover:bg-[#0A2C63]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Details
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {vehicleAvailable && (
            <Modal open={open} onClose={() => setOpen(false)}>
              <PaymentPage bookingId={booking._id} />
            </Modal>
          )}
        </div>
      </div>
    );
  };

  // Desktop booking card
  const DesktopBookingCard = ({ booking }) => {
    const statusStyle = getStatusStyles(booking.status);
    const StatusIcon = statusStyle.icon;
    const vehicleAvailable = isVehicleAvailable(booking.vehicleDetails);

    const [open, setOpen] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col md:flex-row h-auto md:h-64">
          {/* Image container */}
          <div className="w-full md:w-80 h-48 md:h-full relative flex-shrink-0">
            {vehicleAvailable && getVehicleImageUrl(booking.vehicleDetails, 0, API_BASE_URL) ? (
              <img
                src={getVehicleImageUrl(
                  booking.vehicleDetails,
                  0,
                  API_BASE_URL,
                )}
                alt={booking.vehicleDetails.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {!vehicleAvailable ? (
                  <div className="text-center p-4">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-red-600">Vehicle No Longer Available</p>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center p-4">
                    <Car className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm font-medium">No Image</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Content area */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
              <div className="flex-1 min-w-0 pr-3 mb-2 sm:mb-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className={`text-lg font-bold truncate ${vehicleAvailable ? 'text-[#0D3778]' : 'text-gray-500'}`}>
                    {vehicleAvailable ? booking.vehicleDetails.title : 'Vehicle No Longer Available'}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} flex-shrink-0 self-start sm:self-center`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>

              {vehicleAvailable && (
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1 mb-0.5">
                    <StarRating
                      rating={booking.vehicleDetails.rating}
                      size="sm"
                      showNumber={true}
                    />
                  </div>
                  <div className="text-xl font-bold text-[#0D3778]">
                    {formatCurrency(booking.totalAmount, 'LKR')}
                  </div>
                  <p className="text-xs text-gray-500">
                    {booking.days} day{booking.days !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 flex-grow">
              {/* Pickup Date */}
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="bg-blue-50 p-1.5 rounded-lg flex-shrink-0">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="text-sm font-medium truncate">
                      {formatBookingDate(booking.startingDate)}
                    </p>
                  </div>
                </div>

                {/* Owner information  */}
                <div className="flex items-start gap-2">
                  <div className="bg-purple-50 p-1.5 rounded-lg flex-shrink-0">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="text-sm font-medium truncate">
                      {booking.ownerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop-off Date */}
              <div className="flex items-start gap-2">
                <div className="bg-green-50 p-1.5 rounded-lg flex-shrink-0">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Drop-off</p>
                  <p className="text-sm font-medium truncate">
                    {formatBookingDate(booking.endDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
              <button
                onClick={() => setOpen(true)}
                disabled={!vehicleAvailable}
                className={`px-10 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  vehicleAvailable 
                    ? 'bg-[#0D3778] text-white hover:bg-[#0A2C63]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Pay
              </button>
              <button
                onClick={() => handleViewDetails(booking._id)}
                disabled={!vehicleAvailable}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  vehicleAvailable 
                    ? 'bg-[#0D3778] text-white hover:bg-[#0A2C63]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                View Details
              </button>
            </div>
            {vehicleAvailable && (
              <Modal open={open} onClose={() => setOpen(false)}>
                <PaymentPage bookingId={booking._id} />
              </Modal>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <main>
            <div className="bg-gray-50 min-h-[70vh] p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Your Vehicle Booking History
                </h2>
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3778]"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-screen bg-white">
          <main>
            <div className="bg-gray-50 min-h-[70vh] p-4 md:p-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Your Vehicle Booking History
                </h2>
                <div className="bg-white rounded-xl p-6 md:p-8 text-center border border-gray-200">
                  <div className="text-red-400 text-4xl md:text-5xl mb-4">
                    🔒
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
                    Authentication Required
                  </h3>
                  <a
                    href="/login"
                    className="inline-block px-6 py-3 bg-[#0D3778] text-white font-medium rounded-lg hover:bg-[#0A2C63]"
                  >
                    Sign In
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <main>
          <div className="bg-gray-50 min-h-[70vh] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <div className="mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Your Vehicle Booking History
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}{' '}
                    found
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                  <div className="text-gray-400 text-4xl mb-4">🚗</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    No Bookings Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven't booked any vehicles yet.
                  </p>
                  <a
                    href="/vehicles"
                    className="inline-block px-6 py-3 bg-[#0D3778] text-white font-medium rounded-lg hover:bg-[#0A2C63]"
                  >
                    Browse Available Vehicles
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                      {/* Mobile View */}
                      <div className="md:hidden">
                        <MobileBookingCard booking={booking} />
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block">
                        <DesktopBookingCard booking={booking} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal for viewing booking details - only show if vehicle is available */}
      {showModal && selectedBookingId && selectedBooking && isVehicleAvailable(selectedBooking.vehicleDetails) && (
        <VehicleBookingModal
          bookingId={selectedBookingId}
          booking={selectedBooking}
          onClose={handleCloseModal}
          API_BASE_URL={API_BASE_URL}
          API_VERSION={API_VERSION}
        />
      )}
    </Layout>
  );
};

export default BookingHistory;