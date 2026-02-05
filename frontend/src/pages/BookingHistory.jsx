import React, { useState, useEffect } from 'react';
import { Header } from './BookingPageHeader';
import Layout from '../layouts/Layout';
import axios from 'axios';
import { 
  Calendar, 
  User, 
  Phone, 
  Star, 
  MapPin, 
  Car, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Search
} from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(1);
  const [activeTab, setActiveTab] = useState('history');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_VERSION = import.meta.env.VITE_API_VERSION || '';

  // Fetch user authentication
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        if (data?.success && data?.user) {
          setUser(data.user);
          setRole(data.user.role ?? 1);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setRole(1);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setRole(1);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, [API_BASE_URL, API_VERSION]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}${API_VERSION}/authUser/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
    setUser(null);
    setRole(1);
    setIsAuthenticated(false);
  };

  // Fetch bookings only when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCustomerBookings();
    } else if (user === null) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchCustomerBookings = async () => {
    try {
      const userId = user?.userid || user?._id;

      if (!userId) {
        console.error('User ID not found');
        setBookings([]);
        setLoading(false);
        return;
      }

      // Fetch customer bookings from your backend
      const response = await axios.get(
        `${API_BASE_URL}${API_VERSION}/bookings/customer/${userId}`,
        {
          withCredentials: true,
        }
      );

      const bookingsData = response.data.data || [];

      if (bookingsData.length === 0) {
        setBookings([]);
      } else {
        // For each booking, fetch additional details from populated fields
        const enrichedBookings = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              // Get customer details (from populate)
              const customerName = booking.customerId 
                ? `${booking.customerId.first_name || ''} ${booking.customerId.last_name || ''}`.trim()
                : 'Customer';

              // Get owner details (from populate)
              const ownerName = booking.ownerId 
                ? `${booking.ownerId.first_name || ''} ${booking.ownerId.last_name || ''}`.trim()
                : 'Owner';

              const ownerEmail = booking.ownerId?.email || 'N/A';
              const ownerContact = booking.ownerId?.contactNumber || 'N/A';

              // Get vehicle details (from populate)
              let vehicleDetails = {
                title: 'Unknown Vehicle',
                model: 'N/A',
                numberPlate: 'N/A',
                vehicleType: 'N/A',
                year: 'N/A',
                fuelType: 'N/A',
                transmission: 'N/A',
                pricePerDay: 0,
                images: [],
                location: {}
              };

              if (booking.vehicleId) {
                // Try to get detailed vehicle info
                try {
                  const vehicleRes = await axios.get(
                    `${API_BASE_URL}${API_VERSION}/vehicle/get-vehicle/${booking.vehicleId._id || booking.vehicleId}`,
                    {
                      withCredentials: true,
                    }
                  );
                  
                  if (vehicleRes.data.success && vehicleRes.data.vehicle) {
                    const vehicle = vehicleRes.data.vehicle;
                    vehicleDetails = {
                      title: vehicle.title || 'Unknown Vehicle',
                      model: vehicle.model || 'N/A',
                      numberPlate: vehicle.numberPlate || 'N/A',
                      vehicleType: vehicle.vehicleType || 'N/A',
                      year: vehicle.year || 'N/A',
                      fuelType: vehicle.fuelType || 'N/A',
                      transmission: vehicle.transmission || 'N/A',
                      pricePerDay: vehicle.pricePerDay || vehicle.amount || 0,
                      images: vehicle.photos || vehicle.images || [],
                      location: vehicle.location || {}
                    };
                  }
                } catch (vehicleError) {
                  console.error('Error fetching vehicle details:', vehicleError);
                  // Use basic populated data if detailed fetch fails
                  if (typeof booking.vehicleId === 'object') {
                    vehicleDetails.title = booking.vehicleId.title || 'Unknown Vehicle';
                    vehicleDetails.model = booking.vehicleId.model || 'N/A';
                    vehicleDetails.numberPlate = booking.vehicleId.numberPlate || 'N/A';
                  }
                }
              }

              // Calculate days
              const startDate = new Date(booking.startingDate);
              const endDate = new Date(booking.endDate);
              const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

              return {
                ...booking,
                customerName,
                ownerName,
                ownerEmail,
                ownerContact,
                vehicleDetails,
                days,
                createdAt: booking.createdAt || new Date().toISOString(),
                updatedAt: booking.updatedAt || new Date().toISOString()
              };
            } catch (error) {
              console.error('Error enriching booking:', error);
              return {
                ...booking,
                customerName: 'Customer',
                ownerName: 'Owner',
                ownerEmail: 'N/A',
                ownerContact: 'N/A',
                vehicleDetails: {
                  title: 'Unknown Vehicle',
                  model: 'N/A',
                  numberPlate: 'N/A',
                  vehicleType: 'N/A',
                  year: 'N/A',
                  fuelType: 'N/A',
                  transmission: 'N/A',
                  pricePerDay: 0,
                  images: [],
                  location: {}
                },
                days: 1
              };
            }
          })
        );

        setBookings(enrichedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on status, date, and search
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
      return false;
    }

    // Date filter
    const now = new Date();
    const endDate = new Date(booking.endDate);
    if (dateFilter === 'past' && endDate >= now) return false;
    if (dateFilter === 'upcoming' && endDate < now) return false;
    if (dateFilter === 'active') {
      const startDate = new Date(booking.startingDate);
      if (now < startDate || now > endDate || booking.status !== 'approved') return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking._id?.toLowerCase().includes(query) ||
        booking.vehicleDetails.title.toLowerCase().includes(query) ||
        booking.vehicleDetails.model.toLowerCase().includes(query) ||
        booking.vehicleDetails.numberPlate.toLowerCase().includes(query) ||
        booking.ownerName.toLowerCase().includes(query) ||
        booking.status.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle };
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewDetails = (bookingId) => {
    window.location.href = `/booking/${bookingId}`;
  };

  const getVehicleImage = (vehicle) => {
    if (vehicle.images && vehicle.images.length > 0) {
      // Check if image is an object with url property or just a string
      const firstImage = vehicle.images[0];
      return typeof firstImage === 'object' ? firstImage.url : firstImage;
    }
    return null;
  };

  const renderVehicleImage = (booking) => {
    const imageUrl = getVehicleImage(booking.vehicleDetails);
    
    if (imageUrl) {
      return (
        <div className="w-48 relative flex-shrink-0">
          <div className="w-full h-full overflow-hidden">
            <img
              src={`${API_BASE_URL}${imageUrl}`}
              alt={booking.vehicleDetails.title}
              className="w-full h-full object-cover"
              style={{
                height: '180px',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="w-48 relative flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-gray-400 text-center p-4">
          <Car className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm font-medium">No Image</p>
        </div>
      </div>
    );
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Header 
            activeTab={activeTab} 
            onNavigate={setActiveTab}
            role={role}
            isAuthenticated={isAuthenticated}
            user={user}
            notifications={0}
            onLogout={handleLogout}
          />
          <main>
            <div className="bg-gray-50 min-h-[70vh] p-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Vehicle Booking History
                </h2>
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Header 
            activeTab={activeTab} 
            onNavigate={setActiveTab}
            role={role}
            isAuthenticated={isAuthenticated}
            user={user}
            notifications={0}
            onLogout={handleLogout}
          />
          <main>
            <div className="bg-gray-50 min-h-[70vh] p-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Your Vehicle Booking History
                </h2>
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <div className="text-red-400 text-5xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Authentication Required
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Please sign in to view your booking history.
                  </p>
                  <a
                    href="/login"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <Header 
          activeTab={activeTab} 
          onNavigate={setActiveTab}
          role={role}
          isAuthenticated={isAuthenticated}
          user={user}
          notifications={0}
          onLogout={handleLogout}
        />

        <main>
          <div className="bg-gray-50 min-h-[70vh] p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header with filters */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Your Vehicle Booking History
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full sm:w-64"
                      />
                    </div>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Filter options */}
                {showFilters && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Filter
                        </label>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="all">All Dates</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="active">Active</option>
                          <option value="past">Past</option>
                        </select>
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setStatusFilter('all');
                            setDateFilter('all');
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <div className="text-gray-400 text-5xl mb-4">🚗</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' ? 'No Matching Bookings' : 'No Bookings Yet'}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'No bookings match your current filters. Try adjusting your search criteria.'
                      : "You haven't booked any vehicles yet. Start by exploring our wide selection of available vehicles!"}
                  </p>
                  <a
                    href="/vehicles"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Browse Available Vehicles
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredBookings.map((booking) => {
                    const statusStyle = getStatusStyles(booking.status);
                    const StatusIcon = statusStyle.icon;
                    
                    return (
                      <div
                        key={booking._id}
                        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Vehicle Image */}
                          {renderVehicleImage(booking)}

                          {/* Main Content */}
                          <div className="flex-1 p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                              <div className="mb-4 md:mb-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h3 className="text-xl md:text-2xl font-bold text-[#0D3778]">
                                    {booking.vehicleDetails.title}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {getStatusText(booking.status)}
                                  </span>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">
                                    <span className="font-medium">Booking ID:</span> {booking._id}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      <Car className="h-3 w-3" />
                                      {booking.vehicleDetails.model}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      🚗 {booking.vehicleDetails.numberPlate}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      ⛽ {booking.vehicleDetails.fuelType}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      📅 {booking.vehicleDetails.year}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-lg md:text-xl font-bold text-[#0D3778]">
                                  LKR {booking.totalAmount?.toLocaleString() || '0'}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {booking.days} day{booking.days !== 1 ? 's' : ''} • LKR {booking.dailyRate || booking.vehicleDetails.pricePerDay}/day
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Pickup</p>
                                  <p className="font-medium text-gray-900">{formatDate(booking.startingDate)}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <Calendar className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Drop-off</p>
                                  <p className="font-medium text-gray-900">{formatDate(booking.endDate)}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="bg-purple-50 p-2 rounded-lg">
                                  <User className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Owner</p>
                                  <div>
                                    <p className="font-medium text-gray-900">{booking.ownerName}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {booking.ownerContact}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {booking.vehicleDetails.location?.address && (
                              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Pickup Location:</span> {booking.vehicleDetails.location.address}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Sidebar */}
                          <div className="md:w-48 border-t md:border-t-0 md:border-l border-gray-200 p-4 md:p-6 flex flex-col justify-between bg-gray-50 flex-shrink-0">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Booking Created</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatShortDate(booking.createdAt)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatShortDate(booking.updatedAt)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <button
                                onClick={() => handleViewDetails(booking._id)}
                                className="w-full px-4 py-2.5 bg-[#0D3778] text-white text-sm font-semibold rounded-lg hover:bg-[#0A2C63] transition-colors duration-200"
                              >
                                View Full Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default BookingHistory;