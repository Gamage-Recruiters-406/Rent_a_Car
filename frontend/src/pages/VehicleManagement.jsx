import React, { useState, useEffect } from 'react';
import { Car, AlertCircle, CheckCircle, XCircle, FileDown } from 'lucide-react';
import Header from '../layouts/Header';
import { StatCard } from '../components/StatCard';
import { SearchBar } from '../components/SearchBar';
import { Tabs } from '../components/Tabs';
import { VehicleCard } from '../components/VehicleCard';
import { vehicleAPI } from '../api/vehicle.api';
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

function SearchSection({ searchQuery, onSearchChange, onExport }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onFilterClick={() => {}}
          />
        </div>
        <button
          onClick={onExport}
          className="px-6 py-3 bg-blue-700 text-white rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-colors whitespace-nowrap"
        >
          <FileDown className="w-5 h-5" />
          Export Report
        </button>
      </div>
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
  const [activeTab, setActiveTab] = useState('pending');

  // Mock user data
  const user = {
    first_name: 'Admin',
    last_name: 'User',
  };

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleAPI.getAllVehicles();
      
      // Transform API data to match component structure
      const transformedVehicles = (data.vehicles || []).map(vehicle => ({
        id: vehicle._id || vehicle.id,
        name: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle',
        owner: vehicle.ownerName || vehicle.owner?.name || 'Unknown Owner',
        plateNumber: vehicle.plateNumber || vehicle.registrationNumber || 'N/A',
        location: vehicle.location || vehicle.city || 'Unknown',
        year: vehicle.year || new Date().getFullYear(),
        fuelType: vehicle.fuelType || 'Petrol',
        transmission: vehicle.transmission || 'Auto',
        pricePerDay: vehicle.pricePerDay || vehicle.dailyRate || 5000,
        pricePerKm: vehicle.pricePerKm || vehicle.kmRate || 50,
        status: vehicle.status || 'pending',
        submittedDate: vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        image: vehicle.image || vehicle.images?.[0] || null,
      }));
      
      setVehicles(transformedVehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId) => {
    try {
      await vehicleAPI.updateVehicleStatus(vehicleId, 'approved');
      toast.success('Vehicle approved successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to approve vehicle');
    }
  };

  const handleReject = async (vehicleId) => {
    try {
      await vehicleAPI.updateVehicleStatus(vehicleId, 'rejected');
      toast.success('Vehicle rejected successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to reject vehicle');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await vehicleAPI.deleteVehicle(vehicleId);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to delete vehicle');
    }
  };

  const handleView = (vehicle) => {
    // Open modal or navigate to detail page
    console.log('View vehicle:', vehicle);
  };

  const handleExport = () => {
    toast.success('Exporting report...');
  };

  // Calculate statistics
  const stats = {
    total: vehicles.length,
    pending: vehicles.filter(v => v.status?.toLowerCase() === 'pending').length,
    approved: vehicles.filter(v => v.status?.toLowerCase() === 'approved').length,
    rejected: vehicles.filter(v => v.status?.toLowerCase() === 'rejected').length,
  };

  // Filter vehicles based on active tab
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = vehicle.status?.toLowerCase() === activeTab;

    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'approved', label: 'Approved', count: stats.approved },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Component */}
      <Header
        role={3}  // 3 = admin
        user={user}
        isAuthenticated={true}
        onLogout={handleLogout}
        notifications={0}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vehicle Management
          </h1>
          <p className="text-gray-600">
            Manage and moderate vehicle listings
          </p>
        </div>

        {/* Statistics Cards */}
        <VehicleStatistics stats={stats} />

        {/* Search and Filter Section */}
        <SearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExport}
        />

        {/* Tabs and Vehicle List */}
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