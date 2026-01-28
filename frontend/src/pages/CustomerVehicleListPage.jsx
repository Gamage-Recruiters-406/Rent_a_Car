import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Fuel, Zap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../layouts/Layout';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const apiVersion = import.meta.env.VITE_API_VERSION;

export function CustomerVehicleListPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    startDate: '',
    endDate: '',
  });

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      // First, try to get all vehicles (public endpoint)
      let url = `${baseUrl}${apiVersion}/vehicle/get-all`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      // Handle different response formats from backend
      const vehicleList = data.data || data.vehicles || data || [];
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
      
      if (vehicleList.length === 0) {
        toast.success('No vehicles available at the moment');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Don't show error for first load, just show empty state
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    // Implement search/filter logic based on filters state
    console.log('Searching with filters:', filters);
  };

  const handleViewDetails = (vehicleId) => {
    navigate(`/vehicle/${vehicleId}`);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.location && !vehicle.address?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0A2E5C] to-[#1a3a52] text-white py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Find Your Perfect Ride</h1>
            <p className="text-blue-100 text-lg">Choose from our wide selection of quality vehicles</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors w-full md:w-auto"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading vehicles...</p>
              </div>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <>
              {/* Filter Results Info */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredVehicles.length} Vehicle{filteredVehicles.length !== 1 ? 's' : ''} Available
                </h2>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id || vehicle.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 group"
                  >
                    {/* Vehicle Image Container */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <img
                          src={vehicle.photos[0]}
                          alt={vehicle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <div className="text-center">
                            <span className="text-4xl">🚗</span>
                            <p className="text-sm text-gray-600 mt-2">No Image</p>
                          </div>
                        </div>
                      )}
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-800">4.2</span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-5">
                      {/* Title & Model */}
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{vehicle.title || 'Vehicle'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicle.year && `${vehicle.year} • `}
                          {vehicle.vehicleType && `${vehicle.vehicleType}`}
                        </p>
                      </div>

                      {/* Specs Grid */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Fuel</p>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.fuelType || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Transmission</p>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.transmission || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{vehicle.address || 'Location not specified'}</span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-3"></div>

                      {/* Pricing Section */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Per Day</p>
                          <p className="text-2xl font-bold text-gray-900">
                            <span className="text-sm text-gray-600">LKR</span> {vehicle.pricePerDay?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-medium">Per KM</p>
                          <p className="text-xl font-bold text-gray-900">
                            <span className="text-sm text-gray-600">LKR</span> {vehicle.pricePerKm?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => handleViewDetails(vehicle._id || vehicle.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Empty State
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Vehicles Available</h3>
              <p className="text-gray-600 mb-8">For Your Search</p>
              <button
                onClick={fetchVehicles}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default CustomerVehicleListPage;
