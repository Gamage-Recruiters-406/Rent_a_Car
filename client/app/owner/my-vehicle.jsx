import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import AppLayout from "../../components/layout/Layout";
import VehicleSearchFilter from "../../components/owner/VehicleSearchFilter";
import VehicleCard from "../../components/owner/VehicleCard";
import AvailabilityOwner from "../../app/owner/AvailabilityOwner";
import { getMyVehicleListings, deleteVehicleListing, getMyVehicleReviews } from "../../services/vehicleService";
import { isSmallScreen, horizontalPadding } from "../../constants/screenSize";

export default function MyVehicleScreen() {
  const router = useRouter();

  const [vehicles, setVehicles]                   = useState([]);
  const [filteredVehicles, setFilteredVehicles]   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [errorDetail, setErrorDetail]             = useState(null);

  // ─── AvailabilityOwner modal state ────────────────────────────────────────
  // isOpen  → matches the prop name used in AvailabilityOwner
  // vehicle → passed directly as the vehicle object
  const [availIsOpen, setAvailIsOpen]         = useState(false);
  const [availVehicle, setAvailVehicle]       = useState(null);

  // ─── Fetch vehicles ───────────────────────────────────────────────────────
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetail(null);

      // Fetch vehicles and reviews in parallel
      const [vehicleData, reviewData] = await Promise.allSettled([
        getMyVehicleListings(),
        getMyVehicleReviews(),
      ]);

      if (vehicleData.status === "rejected") throw vehicleData.reason;
      if (!vehicleData.value.success) throw new Error(vehicleData.value.message || "API returned success: false");

      let list = vehicleData.value.vehicles ?? [];

      // Merge average ratings from reviews into vehicles
      if (reviewData.status === "fulfilled" && reviewData.value?.reviews) {
        const ratingMap = {};
        reviewData.value.reviews.forEach((review) => {
          const vid = review.vehicle?._id || review.vehicleId;
          if (!vid) return;
          if (!ratingMap[vid]) ratingMap[vid] = { total: 0, count: 0 };
          ratingMap[vid].total += review.rating || 0;
          ratingMap[vid].count += 1;
        });
        list = list.map((v) => {
          const r = ratingMap[v._id];
          return r ? { ...v, rating: parseFloat((r.total / r.count).toFixed(1)) } : { ...v, rating: v.rating ?? 0 };
        });
      }

      setVehicles(list);
      setFilteredVehicles(list);
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "Unknown error";

      if (status === 401) {
        setError("Session expired. Please log in again.");
        setErrorDetail("401 Unauthorized");
      } else if (status === 403) {
        setError("Access denied. Owner account required.");
        setErrorDetail("403 Forbidden");
      } else if (status === 404) {
        setError("API endpoint not found.");
        setErrorDetail("404 — ensure backend is running on port 8090");
      } else if (status === 500) {
        setError("Server error. Please try again.");
        setErrorDetail(`500 — ${message}`);
      } else {
        setError("Failed to load vehicles. Please try again.");
        setErrorDetail(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  // ─── Client-side filter ───────────────────────────────────────────────────
  const handleSearch = ({ numberPlate, type, transmission }) => {
    let results = vehicles;

    if (numberPlate.trim()) {
      results = results.filter((v) =>
        (v.numberPlate || "").toLowerCase().includes(numberPlate.toLowerCase())
      );
    }
    if (type !== "All") {
      results = results.filter(
        (v) => (v.vehicleType || "").toLowerCase() === type.toLowerCase()
      );
    }
    if (transmission !== "All") {
      results = results.filter(
        (v) => (v.transmission || "").toLowerCase() === transmission.toLowerCase()
      );
    }

    setFilteredVehicles(results);
  };

  // ─── Navigation handlers ──────────────────────────────────────────────────
  const handleAddVehicle  = ()   => router.push("/owner/AddVehicle");
  const handleViewDetails = (id) => router.push(`/owner/vehicle-details/${id}`);
  const handleManage      = (id) => router.push(`/owner/EditVehicleOwner?id=${id}`);

  // ─── Availability: open AvailabilityOwner modal ───────────────────────────
  // Pass the full vehicle object — AvailabilityOwner uses vehicle._id & vehicle.title
  const handleAvailability = (vehicle) => {
    setAvailVehicle(vehicle);
    setAvailIsOpen(true);
  };

  const handleAvailClose = () => {
    setAvailIsOpen(false);
    setAvailVehicle(null);
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteVehicleListing(id);
      const updated = vehicles.filter((v) => v._id !== id);
      setVehicles(updated);
      setFilteredVehicles(updated);
      Alert.alert("Deleted", "Vehicle deleted successfully.");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete";
      Alert.alert("Error", message);
    }
  };

  // ─── Render states ────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#0A2E5C" />
          <Text className="text-gray-400 mt-3 text-base">
            Loading vehicles...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center py-16 px-4">
          <Ionicons name="cloud-offline-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-700 mt-3 text-base text-center font-semibold">
            {error}
          </Text>
          {errorDetail && (
            <Text className="text-red-400 mt-2 text-xs text-center px-4">
              {errorDetail}
            </Text>
          )}
          <TouchableOpacity
            className="bg-[#0A2E5C] rounded-lg mt-4 px-6 py-3"
            onPress={fetchVehicles}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredVehicles.length === 0) {
      return (
        <View className="items-center py-16">
          <Ionicons name="car-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-400 mt-3 text-base">
            No vehicles found
          </Text>
        </View>
      );
    }

    return filteredVehicles.map((vehicle) => (
      <VehicleCard
        key={vehicle._id}
        vehicle={vehicle}
        onViewDetails={() => handleViewDetails(vehicle._id)}
        onManage={() => handleManage(vehicle._id)}
        onAvailability={() => handleAvailability(vehicle)}
        onDelete={() => handleDelete(vehicle._id)}
      />
    ));
  };

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <AppLayout>
      {/* Page Title */}
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 20,
          paddingBottom: 8,
        }}
      >
        <Text
          className="text-center font-bold text-gray-800"
          style={{ fontSize: isSmallScreen ? 20 : 24 }}
        >
          My Vehicle
        </Text>
      </View>

      {/* Add New Vehicle Button */}
      <View
        style={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 16,
          alignItems: "flex-end",
        }}
      >
        <TouchableOpacity
          className="bg-[#0A2E5C] rounded-lg flex-row items-center"
          style={{
            paddingVertical: isSmallScreen ? 10 : 12,
            paddingHorizontal: isSmallScreen ? 14 : 18,
            minHeight: Platform.OS === "ios" ? 44 : 48,
          }}
          onPress={handleAddVehicle}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={isSmallScreen ? 16 : 20} color="white" />
          <Text
            className="text-white font-semibold ml-1"
            style={{ fontSize: isSmallScreen ? 13 : 15 }}
          >
            Add New Vehicle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search / Filter Card */}
      <View
        style={{ paddingHorizontal: horizontalPadding, paddingBottom: 20 }}
      >
        <VehicleSearchFilter onSearch={handleSearch} />
      </View>

      {/* Vehicle List */}
      <View
        style={{ paddingHorizontal: horizontalPadding, paddingBottom: 24 }}
      >
        {renderContent()}
      </View>

      {/* AvailabilityOwner Modal */}
      <AvailabilityOwner
        isOpen={availIsOpen}
        onClose={handleAvailClose}
        vehicle={availVehicle}
      />
    </AppLayout>
  );
}