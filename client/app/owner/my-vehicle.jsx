import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import VehicleSearchFilter from "../../components/owner/VehicleSearchFilter";
import VehicleCard from "../../components/owner/VehicleCard";
import { getMyVehicleListings, deleteVehicleListing } from "../../services/vehicleService";
import { isSmallScreen, horizontalPadding } from "../../constants/screenSize";

export default function MyVehicleScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);

  // ─── Fetch vehicles ───────────────────────────────────────────────────────────
  // Controller: GET /vehicle/get-all → { success, count, vehicles: [...] }
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetail(null);

      const data = await getMyVehicleListings();

      if (!data.success) {
        throw new Error(data.message || "API returned success: false");
      }

      const list = data.vehicles ?? [];
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

  // ─── Client-side filter ───────────────────────────────────────────────────────
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

  // ─── Button Handlers ──────────────────────────────────────────────────────────
  const handleAddVehicle = () => router.push("/owner/add-vehicle");

  const handleViewDetails = (id) =>
    router.push(`/owner/vehicle-details/${id}`);

  const handleManage = (id) =>
    router.push(`/owner/vehicle-manage/${id}`);

  const handleAvailability = (id) =>
    router.push(`/owner/vehicle-availability/${id}`);

  const handleDelete = async (id) => {
    try {
      await deleteVehicleListing(id);
      // Remove from local state immediately
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      setFilteredVehicles((prev) => prev.filter((v) => v._id !== id));
      Alert.alert("Deleted", "Vehicle deleted successfully.");
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete";
      Alert.alert("Error", message);
    }
  };

  // ─── Render states ────────────────────────────────────────────────────────────
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
        onAvailability={() => handleAvailability(vehicle._id)}
        onDelete={() => handleDelete(vehicle._id)}
      />
    ));
  };

  // ─── Main render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
    </SafeAreaView>
  );
}