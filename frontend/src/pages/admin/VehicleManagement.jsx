import React, { useState, useEffect } from 'react';
import { Car, AlertCircle, CheckCircle, XCircle, FileDown } from 'lucide-react';
import Header from '../../layouts/Header';
import { StatCard } from '../../components/adminVehicle/StatCard';
import { SearchBar } from '../../components/adminVehicle/SearchBar';
import { Tabs } from '../../components/adminVehicle/Tabs';
import { VehicleCard } from '../../components/adminVehicle/VehicleCard';
import { vehicleAPI, VEHICLE_STATUS, getImageBaseUrl, getUserById, resolveUserName } from '../../services/vehicleService';
import toast from 'react-hot-toast';

function VehicleStatistics({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={Car}         label="Total Vehicles"    value={stats.total}    color="text-blue-600"   bgColor="bg-blue-100"   />
      <StatCard icon={AlertCircle} label="Pending Approval"  value={stats.pending}  color="text-yellow-600" bgColor="bg-yellow-100" />
      <StatCard icon={CheckCircle} label="Active Listings"   value={stats.approved} color="text-green-600"  bgColor="bg-green-100"  />
      <StatCard icon={XCircle}     label="Rejected"          value={stats.rejected} color="text-red-600"    bgColor="bg-red-100"    />
    </div>
  );
}

function SearchSection({ searchQuery, onSearchChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <SearchBar value={searchQuery} onChange={onSearchChange} onFilterClick={() => {}} />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
        <p className="text-gray-600">
          {searchQuery ? 'Try adjusting your search criteria' : `No ${activeTab} vehicles at the moment`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id ?? `vehicle-${index}`}
          vehicle={vehicle}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
          onView={onView}
          status={activeTab}
        />
      ))}
    </div>
  );
}

function RejectionReasonModal({ vehicle, isOpen, onClose, onConfirm, isProcessing = false }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setIsSubmitting(true);
    try { await onConfirm?.(vehicle?.id, reason.trim()); }
    finally { setIsSubmitting(false); setReason(''); }
  };

  if (!isOpen || !vehicle) return null;
  const isDisabled = isSubmitting || isProcessing || !reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <button type="button" onClick={onClose} disabled={isSubmitting || isProcessing}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white disabled:opacity-50">
          <XCircle className="w-5 h-5 text-gray-700" />
        </button>
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Vehicle</h2>
          <p className="text-gray-600 mb-6">{vehicle?.name}</p>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Rejection Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for rejecting this vehicle..." rows="4"
              disabled={isSubmitting || isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:opacity-50" />
          </div>
          <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting || isProcessing}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={isDisabled}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {isSubmitting || isProcessing ? 'Rejecting...' : 'Reject Vehicle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleDetailsModal({ vehicle, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen || !vehicle) return null;
  const handleApprove = () => onApprove?.(vehicle.id);
  const handleRejectClick = () => { onClose(); onReject?.('open-modal', vehicle.id); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button type="button" onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white">
          <XCircle className="w-5 h-5 text-gray-700" />
        </button>
        <div className="h-40 md:h-80 w-full bg-gray-100 overflow-hidden">
          {vehicle.images?.length > 0 ? (
            <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full object-cover" />
          ) : vehicle.image ? (
            <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No image available</div>
          )}
        </div>
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6">
            {[
              { label: 'Vehicle Type',   value: vehicle.name },
              { label: 'Vehicle Number', value: vehicle.plateNumber },
              { label: 'Owner',          value: vehicle.owner },
              { label: 'Model & Year',   value: vehicle.year },
              { label: 'Fuel Type',      value: vehicle.fuelType },
              { label: 'Transmission',   value: vehicle.transmission },
              { label: 'Price Per Day',  value: `LKR ${vehicle.pricePerDay}` },
              { label: 'Price Per KM',   value: `LKR ${vehicle.pricePerKm}` },
              { label: 'Location',       value: vehicle.location },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 md:mb-2">{label}</p>
                <p className="text-sm md:text-base font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          {vehicle.operationAreas?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Operation Areas</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.operationAreas.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">{area}</span>
                ))}
              </div>
            </div>
          )}
          {vehicle.documents?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Document Submitted</p>
              <div className="flex flex-wrap gap-2">
                {vehicle.documents.map((doc, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium">{doc}</span>
                ))}
              </div>
            </div>
          )}
          <hr className="border-gray-200 my-6" />
          {vehicle.status === 'approved' && vehicle.approvalDate && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Approved on {vehicle.approvalDate}
            </div>
          )}
          {vehicle.status === 'rejected' && vehicle.rejectionReason && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium flex items-start gap-2">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rejection Reason</p>
                <p className="text-sm mt-1">{vehicle.rejectionReason}</p>
              </div>
            </div>
          )}
          {vehicle.status === 'pending' && (
            <div className="mt-6 flex flex-col sm:flex-row gap-2 md:gap-4 justify-center border-t border-gray-200 pt-4 md:pt-6">
              <button type="button" onClick={handleApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-blue-900 text-white text-sm md:text-base font-semibold hover:bg-blue-950 transition-colors">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Approve
              </button>
              <button type="button" onClick={handleRejectClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg bg-red-600 text-white text-sm md:text-base font-semibold hover:bg-red-700 transition-colors">
                <XCircle className="w-4 h-4 md:w-5 md:h-5" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(VEHICLE_STATUS.PENDING);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectionVehicle, setRejectionVehicle] = useState(null);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { first_name: 'Admin', last_name: 'User', role: 3 };
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await vehicleAPI.getAllVehicles();
      const vehiclesData = response?.vehicles || [];

      if (!Array.isArray(vehiclesData)) {
        console.warn('Invalid vehicles data format:', vehiclesData);
        setVehicles([]);
        return;
      }

      // ── DEBUG: log the first raw vehicle so we can see exact field names ────
      if (vehiclesData.length > 0) {
        console.log('=== DEBUG: Raw vehicle[0] from backend ===');
        console.log(JSON.stringify(vehiclesData[0], null, 2));
        console.log('owner field value:', vehiclesData[0]?.owner);
        console.log('owner field type:', typeof vehiclesData[0]?.owner);
      }

      // ── Helpers ──────────────────────────────────────────────────────────────
      const getLocationString = (v) => {
        const loc = v.location;
        if (typeof loc === 'string') return loc || 'Unknown';
        if (loc && typeof loc === 'object' && 'address' in loc) return loc.address || 'Unknown';
        return v.city || v.address || 'Unknown';
      };

      const apiBase = getImageBaseUrl();
      const toFullImageUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${apiBase}${url.startsWith('/') ? url : `/${url}`}`;
      };

      const getPhotoUrls = (v) => {
        const out = [];
        if (Array.isArray(v.photos) && v.photos.length > 0) {
          v.photos.forEach((p) => {
            const u = typeof p === 'string' ? p : p?.url;
            if (u) { const f = toFullImageUrl(u); if (f) out.push(f); }
          });
        }
        if (out.length) return out;
        if (v.image && typeof v.image === 'string') return [toFullImageUrl(v.image)];
        if (Array.isArray(v.images)) {
          v.images.forEach((u) => {
            const f = typeof u === 'string' ? toFullImageUrl(u) : (u?.url ? toFullImageUrl(u.url) : null);
            if (f) out.push(f);
          });
        }
        return out;
      };

      const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      };

      // ── Step 1: Collect unique owner IDs (bare MongoDB ObjectId strings) ─────
      const ownerIdSet = new Set();
      vehiclesData.forEach((v) => {
        const ownerId = v.owner;
        if (ownerId && typeof ownerId === 'string' && /^[a-f\d]{24}$/i.test(ownerId)) {
          ownerIdSet.add(ownerId);
        }
      });

      console.log('=== DEBUG: Unique owner IDs to fetch ===', [...ownerIdSet]);

      // ── Step 2: Fetch all owners in parallel ─────────────────────────────────
      const ownerCache = {};
      await Promise.all(
        [...ownerIdSet].map(async (ownerId) => {
          try {
            const data = await getUserById(ownerId);
            console.log(`=== DEBUG: getUserById(${ownerId}) response ===`, data);

            // Backend may return { success, user } OR just the user object directly
            const userObj = data?.user ?? data;
            console.log(`=== DEBUG: resolved userObj for ${ownerId} ===`, userObj);

            ownerCache[ownerId] = resolveUserName(userObj);
            console.log(`=== DEBUG: resolved name for ${ownerId} ===`, ownerCache[ownerId]);
          } catch (err) {
            console.warn(`Could not fetch owner ${ownerId}:`, err.message);
            ownerCache[ownerId] = 'Unknown Owner';
          }
        })
      );

      // ── Step 3: Transform vehicles ───────────────────────────────────────────
      const transformedVehicles = vehiclesData.map((vehicle, index) => {
        const imageUrls = getPhotoUrls(vehicle);

        let ownerName = 'Unknown Owner';
        if (vehicle.ownerName) {
          // flat string field on vehicle
          ownerName = vehicle.ownerName;
        } else if (vehicle.owner && typeof vehicle.owner === 'string' && /^[a-f\d]{24}$/i.test(vehicle.owner)) {
          // bare ID → look up in cache
          ownerName = ownerCache[vehicle.owner] || 'Unknown Owner';
        } else if (vehicle.owner && typeof vehicle.owner === 'object') {
          // already populated object
          ownerName = resolveUserName(vehicle.owner);
        }

        return {
          id: vehicle._id || vehicle.id || `vehicle-${index}`,
          name: `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.title || 'Unknown Vehicle',
          owner: ownerName,
          plateNumber: vehicle.plateNumber || vehicle.numberPlate || vehicle.registrationNumber || vehicle.licensePlate || 'N/A',
          location: getLocationString(vehicle),
          year: vehicle.year || vehicle.modelYear || new Date().getFullYear(),
          fuelType: vehicle.fuelType || vehicle.fuel || 'Petrol',
          transmission: vehicle.transmission || vehicle.gearbox || 'Auto',
          pricePerDay: vehicle.pricePerDay || vehicle.dailyRate || vehicle.rentPerDay || 5000,
          pricePerKm: vehicle.pricePerKm || vehicle.kmRate || vehicle.perKmRate || 50,
          status: String(vehicle.status || VEHICLE_STATUS.PENDING).toLowerCase(),
          rejectionReason: vehicle.rejectionReason || vehicle.rejectReason || null,
          submittedDate: formatDate(vehicle.createdAt) || new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          approvalDate: formatDate(vehicle.approvedAt) || formatDate(vehicle.updatedAt) || null,
          operationAreas: Array.isArray(vehicle.operationAreas) ? vehicle.operationAreas : [],
          documents: Array.isArray(vehicle.documents)
            ? vehicle.documents.map(d => typeof d === 'string' ? d : d.name || d.type || 'Document')
            : [],
          image: imageUrls[0] || null,
          images: imageUrls,
        };
      });

      setVehicles(transformedVehicles);
      console.log('Vehicles loaded successfully');

    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Failed to load vehicles';
        if (status === 401) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }, 1500);
        } else if (status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          toast.error(message);
        }
      } else if (error.request) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('An error occurred while loading vehicles');
      }
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vehicleId) => {
    if (!vehicleId) { toast.error('Invalid vehicle ID'); return; }
    if (isProcessing) { toast.error('Please wait for the current operation to complete'); return; }
    setIsProcessing(true);
    try {
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.APPROVED);
      toast.success('Vehicle approved successfully');
      setIsDetailsOpen(false);
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to approve vehicle:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }, 1500);
      } else {
        toast.error(error.response?.data?.message || 'Failed to approve vehicle');
      }
    } finally { setIsProcessing(false); }
  };

  const handleReject = async (vehicleIdOrAction, vehicleId) => {
    if (vehicleIdOrAction === 'open-modal') {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) { setRejectionVehicle(vehicle); setIsRejectionOpen(true); }
      return;
    }
    const id = vehicleIdOrAction;
    if (!id) { toast.error('Invalid vehicle ID'); return; }
    if (isProcessing) { toast.error('Please wait for the current operation to complete'); return; }
    setIsProcessing(true);
    try {
      await vehicleAPI.updateVehicleStatus(id, VEHICLE_STATUS.REJECTED);
      toast.success('Vehicle rejected successfully');
      setIsDetailsOpen(false);
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to reject vehicle:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }, 1500);
      } else {
        toast.error(error.response?.data?.message || 'Failed to reject vehicle');
      }
    } finally { setIsProcessing(false); }
  };

  const handleRejectWithReason = async (vehicleId, rejectionReason) => {
    if (!vehicleId) { toast.error('Invalid vehicle'); return; }
    if (!rejectionReason?.trim()) { toast.error('Please provide a rejection reason'); return; }
    if (isProcessing) { toast.error('Please wait for the current operation to complete'); return; }
    setIsProcessing(true);
    try {
      await vehicleAPI.updateVehicleStatus(vehicleId, VEHICLE_STATUS.REJECTED, rejectionReason.trim());
      toast.success('Vehicle rejected successfully');
      setIsRejectionOpen(false);
      setRejectionVehicle(null);
      setIsDetailsOpen(false);
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to reject vehicle:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }, 1500);
      } else {
        toast.error(error.response?.data?.message || 'Failed to reject vehicle');
      }
    } finally { setIsProcessing(false); }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return;
    try {
      await vehicleAPI.deleteVehicle(vehicleId);
      toast.success('Vehicle deleted successfully');
      await fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      if (error.response?.status === 401) toast.error('Session expired. Please login again.');
      else if (error.response?.status === 403) toast.error('Only the vehicle owner can delete this listing.');
      else toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const handleView = (vehicle) => { setSelectedVehicle(vehicle); setIsDetailsOpen(true); };

  const handleExport = () => {
    try {
      if (vehicles.length === 0) { toast.error('No vehicles to export'); return; }
      const headers = ['ID', 'Name', 'Owner', 'Plate Number', 'Location', 'Year', 'Fuel Type', 'Transmission', 'Price/Day (LKR)', 'Price/Km (LKR)', 'Status', 'Submitted Date'];
      const csvRows = [
        headers.join(','),
        ...vehicles.map(v => [v.id, `"${v.name}"`, `"${v.owner}"`, v.plateNumber, `"${v.location}"`, v.year, v.fuelType, v.transmission, v.pricePerDay, v.pricePerKm, v.status, v.submittedDate].join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
    total:    vehicles.length,
    pending:  vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.PENDING).length,
    approved: vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.APPROVED).length,
    rejected: vehicles.filter(v => (v.status || '') === VEHICLE_STATUS.REJECTED).length,
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (vehicle.name        || '').toLowerCase().includes(searchLower) ||
      (vehicle.plateNumber || '').toLowerCase().includes(searchLower) ||
      (vehicle.owner       || '').toLowerCase().includes(searchLower) ||
      (vehicle.location    || '').toLowerCase().includes(searchLower);
    return matchesSearch && (vehicle.status || '') === activeTab;
  });

  const tabs = [
    { id: VEHICLE_STATUS.PENDING,  label: 'Pending',  count: stats.pending  },
    { id: VEHICLE_STATUS.APPROVED, label: 'Approved', count: stats.approved },
    { id: VEHICLE_STATUS.REJECTED, label: 'Rejected', count: stats.rejected },
  ];

  const safeUser = user && typeof user === 'object' ? user : { first_name: 'Admin', last_name: 'User', role: 3 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header role={3} user={safeUser} isAuthenticated={true} onLogout={handleLogout} notifications={0} />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Management</h1>
            <p className="text-gray-600">Manage and moderate vehicle listings</p>
          </div>
          <button onClick={handleExport} disabled={vehicles.length === 0}
            className="px-6 py-3 bg-blue-700 text-white rounded-xl flex items-center gap-2 hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            <FileDown className="w-5 h-5" /> Export Report
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
              vehicles={filteredVehicles} loading={loading}
              searchQuery={searchQuery} activeTab={activeTab}
              onApprove={handleApprove} onReject={handleReject}
              onDelete={handleDelete} onView={handleView}
            />
          </div>
        </div>
      </div>
      <VehicleDetailsModal vehicle={selectedVehicle} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onApprove={handleApprove} onReject={handleReject} />
      <RejectionReasonModal vehicle={rejectionVehicle} isOpen={isRejectionOpen} onClose={() => setIsRejectionOpen(false)} onConfirm={handleRejectWithReason} isProcessing={isProcessing} />
    </div>
  );
}

export default VehicleManagement;