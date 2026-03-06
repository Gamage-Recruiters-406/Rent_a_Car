import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { isSmallScreen } from "../../constants/screenSize";
import { getImageBaseUrl } from "../../services/vehicleService";

// ─── Status color helper ──────────────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case "Approved": return "#10B981";
    case "Rejected": return "#EF4444";
    case "Pending":  return "#F59E0B";
    default:         return "#9CA3AF";
  }
};

// ─── VehicleCard ──────────────────────────────────────────────────────────────
export default function VehicleCard({
  vehicle,
  onViewDetails,
  onManage,
  onAvailability,
  onDelete,
}) {
  const iconSize  = isSmallScreen ? 16 : 18;
  const imageSize = isSmallScreen ? 100 : 115;

  const BASE_URL   = getImageBaseUrl();
  const firstPhoto = vehicle?.photos?.[0];
  const imageUri   = firstPhoto?.url ? `${BASE_URL}${firstPhoto.url}` : null;

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Vehicle",
      `Are you sure you want to delete "${vehicle.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View
      className="bg-white rounded-xl mb-4 overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* ── Top Section: Image + Info ── */}
      <View className="flex-row">

        {/* Vehicle Image */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: imageSize, height: imageSize }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{ width: imageSize, height: imageSize }}
            className="bg-gray-100 justify-center items-center"
          >
            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            <Text className="text-gray-400 mt-1 text-center px-2" style={{ fontSize: 9 }}>
              Image not found
            </Text>
          </View>
        )}

        {/* Vehicle Info */}
        <View className="flex-1 px-3 py-2">
          {/* Title & Price */}
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="font-bold text-[#0A2E5C] flex-1 mr-1"
              style={{ fontSize: isSmallScreen ? 14 : 16 }}
              numberOfLines={1}
            >
              {vehicle.title}
            </Text>
            <Text className="font-bold text-[#0A2E5C]" style={{ fontSize: isSmallScreen ? 13 : 14 }}>
              RS.{vehicle.pricePerDay}
            </Text>
          </View>

          {/* Booking ID */}
          <Text className="text-gray-400 mb-1" style={{ fontSize: isSmallScreen ? 10 : 11 }}>
            Booking ID: {vehicle._id?.toString().slice(-7)}
          </Text>

          {/* Tags */}
          <Text
            className="text-gray-700 font-medium mb-1"
            style={{ fontSize: isSmallScreen ? 10 : 11 }}
            numberOfLines={1}
          >
            {vehicle.model} • {vehicle.year} • {vehicle.vehicleType} • {vehicle.transmission} • {vehicle.seats} Seats
          </Text>

          {/* Plate */}
          <Text className="text-gray-600 mb-1" style={{ fontSize: isSmallScreen ? 10 : 11 }}>
            Plate: {vehicle.numberPlate}
          </Text>

          {/* Pricing */}
          <Text style={{ fontSize: isSmallScreen ? 10 : 11 }} className="mb-1">
            <Text className="text-green-600 font-semibold">RS.{vehicle.pricePerDay}/day</Text>
            <Text className="text-gray-400"> • </Text>
            <Text className="text-green-600 font-semibold">RS.{vehicle.pricePerKm}/km</Text>
          </Text>

          {/* Location */}
          {vehicle.location?.address ? (
            <View className="flex-row items-center mb-1">
              <Ionicons name="location-sharp" size={10} color="#0A2E5C" />
              <Text
                className="text-[#0A2E5C] ml-1"
                style={{ fontSize: isSmallScreen ? 10 : 11 }}
                numberOfLines={1}
              >
                {vehicle.location.address}
              </Text>
            </View>
          ) : null}

          {/* Stars & Status */}
          <View className="flex-row justify-between items-center mt-1">
            <StarRating rating={vehicle.rating ?? 0} />
            <View className="flex-row items-center">
              <View style={{
                width: 7, height: 7, borderRadius: 4,
                backgroundColor: getStatusColor(vehicle.status),
                marginRight: 4,
              }} />
              <Text style={{
                fontSize: isSmallScreen ? 10 : 11,
                color: getStatusColor(vehicle.status),
                fontWeight: "600",
              }}>
                {vehicle.status ?? "Pending"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Bottom: 4 icon buttons ── */}
      <View
        className="flex-row border-t border-gray-100"
        style={{ paddingHorizontal: 8, paddingVertical: 8, gap: 6 }}
      >
        {/* View Details → navigates to details page */}
        <TouchableOpacity
          className="flex-1 bg-[#0A2E5C] rounded-lg justify-center items-center"
          style={{ paddingVertical: isSmallScreen ? 5 : 7 }}
          onPress={onViewDetails}
          activeOpacity={0.8}
        >
          <Ionicons name="information-circle-outline" size={iconSize} color="white" />
        </TouchableOpacity>

        {/* Edit */}
        <TouchableOpacity
          className="flex-1 bg-[#0A2E5C] rounded-lg justify-center items-center"
          style={{ paddingVertical: isSmallScreen ? 5 : 7 }}
          onPress={onManage}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={iconSize} color="white" />
        </TouchableOpacity>

        {/* Availability */}
        <TouchableOpacity
          className="flex-1 bg-[#0A2E5C] rounded-lg justify-center items-center"
          style={{ paddingVertical: isSmallScreen ? 5 : 7 }}
          onPress={onAvailability}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={iconSize} color="white" />
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          className="flex-1 bg-red-500 rounded-lg justify-center items-center"
          style={{ paddingVertical: isSmallScreen ? 5 : 7 }}
          onPress={handleDeletePress}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={iconSize} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}