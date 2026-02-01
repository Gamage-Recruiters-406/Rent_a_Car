import React, { useState, useEffect } from 'react';
import { Car, AlertCircle, CheckCircle, XCircle, FileDown } from 'lucide-react';
import Header from '../layouts/Header';
import { StatCard } from '../components/StatCard';
import { SearchBar } from '../components/SearchBar';
import { Tabs } from '../components/Tabs';
import { VehicleCard } from '../components/VehicleCard';
import { vehicleAPI, VEHICLE_STATUS } from '../services/vehicleService';
import toast from 'react-hot-toast';

function VehicleStatistics({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Car}
        label="Total Vehicles"
        value={stats.total}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        icon={AlertCircle}
        label="Pending Approval"
        value={stats.pending}
        color="text-yellow-600"
        bgColor="bg-yellow-100"
      />
      <StatCard
        icon={CheckCircle}
        label="Active Listings"
        value={stats.approved}
        color="text-green-600"
        bgColor="bg-green-100"
      />
      <StatCard
        icon={XCircle}
        label="Rejected"
        value={stats.rejected}
        color="text-red-600"
        bgColor="bg-red-100"
      />
    </div>
  );
}

function SearchSection({ searchQuery, onSearchChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onFilterClick={() => {}}
      />
    </div>
  );
}

function VehicleList({ vehicles, loading, searchQuery, activeTab, onApprove, onReject, onDelete, onView }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No vehicles found
        </h3>
        <p className="text-gray-600">
          {searchQuery
            ? 'Try adjusting your search criteria'
            : `No ${activeTab} vehicles at the moment`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}

export function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(VEHICLE_STATUS.PENDING);

  // Get user from localStorage or use mock data
  const user = JSON.parse(localStorage.getItem('user') || '{"first_name":"Admin","last_name":"User"}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('Fetching vehicles from:', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090'}/api/v1/vehicle/admin/get-all`);
      
      const response = await vehicleAPI.getAllVehicles();
      console.log('API Response:', response);
      
      // Handle different response structures
      const vehiclesData = response?.vehicles || response?.data || [];
      
      if (!Array.isArray(vehiclesData)) {
        console.warn('Invalid vehicles data:', vehiclesData);
        setVehicles([]);
        toast.error('Invalid data format received from server');
        return;
      }

      console.log(`Processing ${vehiclesData.length} vehicles`);
      
      // Transform backend data to frontend structure
      const transformedVehicles = vehiclesData.map(vehicle => ({
        id: vehicle._id || vehicle.id,
        name: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle',
        owner: vehicle.ownerName || vehicle.owner?.first_name || vehicle.owner?.name || 'Unknown Owner',
        plateNumber: vehicle.plateNumber || vehicle.registrationNumber || vehicle.licensePlate || 'N/A',
        location: vehicle.location || vehicle.city || vehicle.address || 'Unknown',
        year: vehicle.year || vehicle.modelYear || new Date().getFullYear(),
        fuelType: vehicle.fuelType || vehicle.fuel || 'Petrol',
        transmission: vehicle.transmission || vehicle.gearbox || 'Auto',
        pricePerDay: vehicle.pricePerDay || vehicle.dailyRate || vehicle.rentPerDay || 5000,
        pricePerKm: vehicle.pricePerKm || vehicle.kmRate || vehicle.perKmRate || 50,
        status: (vehicle.status || VEHICLE_STATUS.PENDING).toLowerCase(),
        submittedDate: vehicle.createdAt 
          ? new Date(vehicle.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })
          : new Date().toLocaleDateString(),
        image: vehicle.image || vehicle.images?.[0] || vehicle.photos?.[0] || null,
      }));
      
      console.log('Transformed vehicles:', transformedVehicles);
      setVehicles(transformedVehicles);
      
      if (transformedVehicles.length === 0) {
        //toast.info('No vehicles available');
      }
      
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      
      if (error.message.includes('Unauthorized')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check if backend is running on port 8090.');
      } else {
        toast.error(error.message || 'Failed to load vehicles');
      }
      
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId) => {
    try {
      console.log('Approving vehicle:', vehicleId);
      
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.APPROVED);
      
      toast.success('Vehicle approved successfully');
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to approve vehicle:', error);
      toast.error(error.message || 'Failed to approve vehicle');
    }
  };

  const handleReject = async (vehicleId) => {
    try {
      console.log('Rejecting vehicle:', vehicleId);
      
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.REJECTED);
      
      toast.success('Vehicle rejected successfully');
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to reject vehicle:', error);
      toast.error(error.message || 'Failed to reject vehicle');
    }
  };

  const handleDelete = async (vehicleId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vehicle? This action cannot be undone.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      console.log('Deleting vehicle:', vehicleId);
      
      await vehicleAPI.deleteVehicle(vehicleId);
      
      toast.success('Vehicle deleted successfully');
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      toast.error(error.message || 'Failed to delete vehicle');
    }
  };

  const handleView = (vehicle) => {
    console.log('View vehicle:', vehicle);
    //toast.info('Vehicle details view - Coming soon');
  };

  const handleExport = () => {
    try {
      console.log('Exporting vehicle report...');
      
      if (vehicles.length === 0) {
        toast.error('No vehicles to export');
        return;
      }
      
      const headers = [
        'ID',
        'Name',
        'Owner',
        'Plate Number',
        'Location',
        'Year',
        'Fuel Type',
        'Transmission',
        'Price/Day (LKR)',
        'Price/Km (LKR)',
        'Status',
        'Submitted Date'
      ];
      
      const csvRows = [
        headers.join(','),
        ...vehicles.map(v => [
          v.id,
          `"${v.name}"`,
          `"${v.owner}"`,
          v.plateNumber,
          `"${v.location}"`,
          v.year,
          v.fuelType,
          v.transmission,
          v.pricePerDay,
          v.pricePerKm,
          v.status,
          v.submittedDate
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicle-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export report');
    }
  };

  const stats = {
    total: vehicles.length,
    pending: vehicles.filter(v => v.status === VEHICLE_STATUS.PENDING).length,
    approved: vehicles.filter(v => v.status === VEHICLE_STATUS.APPROVED).length,
    rejected: vehicles.filter(v => v.status === VEHICLE_STATUS.REJECTED).length,
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchLower) ||
      vehicle.plateNumber.toLowerCase().includes(searchLower) ||
      vehicle.owner.toLowerCase().includes(searchLower) ||
      vehicle.location.toLowerCase().includes(searchLower);

    const matchesTab = vehicle.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: VEHICLE_STATUS.PENDING, label: 'Pending', count: stats.pending },
    { id: VEHICLE_STATUS.APPROVED, label: 'Approved', count: stats.approved },
    { id: VEHICLE_STATUS.REJECTED, label: 'Rejected', count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        role={3}
        user={user}
        isAuthenticated={true}
        onLogout={handleLogout}
        notifications={0}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vehicle Management
            </h1>
            <p className="text-gray-600">
              Manage and moderate vehicle listings
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={vehicles.length === 0}
            className="px-6 py-3 bg-blue-700 text-white rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <VehicleStatistics stats={stats} />
        <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 pb-0">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="p-6">
            <VehicleList
              vehicles={filteredVehicles}
              loading={loading}
              searchQuery={searchQuery}
              activeTab={activeTab}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
              onView={handleView}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleManagement;