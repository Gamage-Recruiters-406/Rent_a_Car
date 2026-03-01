import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { isSmallScreen } from "../../constants/screenSize";
import { getImageBaseUrl } from "../../services/vehicleService";

/**
 * VehicleCard
 *
 * Vehicle fields from controller (getMyVehicleListings):
 *   _id, title, numberPlate, model, vehicleType, seats, year,
 *   fuelType, transmission, pricePerDay, km, pricePerKm,
 *   photos: [{ url: "/uploads/<id>/<file>", key: "<file>" }],
 *   location: { address, geo },
 *   status, ownerId, createdAt
 *
 * Props:
 *   vehicle       {object}    — vehicle object from API
 *   onViewRenter  {function}  — called when renter icon is pressed
 *   onViewDetails {function}  — called when details icon is pressed
 */
export default function VehicleCard({ vehicle, onViewRenter, onViewDetails }) {
  const imageSize = isSmallScreen ? 110 : 130;
  const iconSize  = isSmallScreen ? 32 : 36;

  // photos is [{ url: "/uploads/<vehicleId>/<filename>", key }]
  // Need to prepend BASE_URL to get full image URL
  const firstPhoto = vehicle?.photos?.[0];
  const imageUri   = firstPhoto?.url
    ? `${getImageBaseUrl()}${firstPhoto.url}`
    : null;

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "#10B981"; // green
      case "Rejected": return "#EF4444"; // red
      case "Pending":  return "#F59E0B"; // amber
      default:         return "#9CA3AF"; // gray
    }
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
            <Ionicons name="car-outline" size={40} color="#9CA3AF" />
          </View>
        )}

        {/* Vehicle Info */}
        <View className="flex-1 p-3">

          {/* Title & Price */}
          <View className="flex-row justify-between items-start mb-1">
            <Text
              className="font-bold text-gray-800 flex-1 mr-2"
              style={{ fontSize: isSmallScreen ? 14 : 16 }}
              numberOfLines={1}
            >
              {vehicle.title}
            </Text>
            <Text
              className="font-bold text-gray-800"
              style={{ fontSize: isSmallScreen ? 13 : 15 }}
            >
              RS.{vehicle.pricePerDay}
            </Text>
          </View>

          {/* Status Badge */}
          <View className="flex-row items-center mb-1">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: getStatusColor(vehicle.status),
                marginRight: 5,
              }}
            />
            <Text
              style={{
                fontSize: isSmallScreen ? 10 : 11,
                color: getStatusColor(vehicle.status),
                fontWeight: "600",
              }}
            >
              {vehicle.status ?? "Pending"}
            </Text>
          </View>

          {/* Tags: model • year • fuelType • transmission */}
          <Text
            className="text-gray-600 mb-1"
            style={{ fontSize: isSmallScreen ? 11 : 12 }}
            numberOfLines={1}
          >
            {vehicle.model} • {vehicle.year} • {vehicle.fuelType} • {vehicle.transmission}
          </Text>

          {/* Number Plate */}
          <Text
            className="text-gray-600 mb-1"
            style={{ fontSize: isSmallScreen ? 11 : 12 }}
          >
            Plate: {vehicle.numberPlate}
          </Text>

          {/* Pricing */}
          <Text
            className="mb-2"
            style={{ fontSize: isSmallScreen ? 11 : 12 }}
          >
            <Text className="text-green-600 font-semibold">
              RS.{vehicle.pricePerDay}/day
            </Text>
            <Text className="text-gray-400"> • </Text>
            <Text className="text-green-600 font-semibold">
              RS.{vehicle.pricePerKm}/km
            </Text>
          </Text>

          {/* Stars & Action Buttons */}
          <View className="flex-row justify-between items-center">
            <StarRating rating={vehicle.rating ?? 0} />

            <View className="flex-row">
              {/* View Renter Button */}
              <TouchableOpacity
                className="bg-[#0A2E5C] rounded-lg mr-2 justify-center items-center"
                style={{ width: iconSize, height: iconSize }}
                onPress={onViewRenter}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="people"
                  size={isSmallScreen ? 15 : 17}
                  color="white"
                />
              </TouchableOpacity>

              {/* View Details Button */}
              <TouchableOpacity
                className="bg-[#0A2E5C] rounded-lg justify-center items-center"
                style={{ width: iconSize, height: iconSize }}
                onPress={onViewDetails}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="document-text"
                  size={isSmallScreen ? 15 : 17}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
}