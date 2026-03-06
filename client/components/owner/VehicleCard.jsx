import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { isSmallScreen } from "../../constants/screenSize";
import { getImageBaseUrl } from "../../services/vehicleService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Status color helper ──────────────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case "Approved": return "#10B981";
    case "Rejected": return "#EF4444";
    case "Pending":  return "#F59E0B";
    default:         return "#9CA3AF";
  }
};

// ─── Detail Row: label + value ────────────────────────────────────────────────
const DetailItem = ({ label, value }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 2 }}>{label}</Text>
    <Text style={{ fontSize: 15, fontWeight: "600", color: "#1F2937" }}>{value || "—"}</Text>
  </View>
);

// ─── Vehicle Detail Modal ─────────────────────────────────────────────────────
function VehicleDetailModal({ vehicle, visible, onClose }) {
  if (!vehicle) return null;

  const BASE_URL   = getImageBaseUrl();
  const firstPhoto = vehicle?.photos?.[0];
  const imageUri   = firstPhoto?.url ? `${BASE_URL}${firstPhoto.url}` : null;

  const statusColor = getStatusColor(vehicle.status);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}>
          {/* Modal Card */}
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: "white",
              borderRadius: 16,
              width: SCREEN_WIDTH - 32,
              maxHeight: "88%",
              overflow: "hidden",
            }}>

              {/* ── Vehicle Image ── */}
              <View style={{ position: "relative" }}>
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                  />
                ) : (
                  <View style={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                    <Ionicons name="car-outline" size={64} color="#D1D5DB" />
                    <Text style={{ color: "#9CA3AF", marginTop: 8 }}>No photo available</Text>
                  </View>
                )}

                {/* Close button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    backgroundColor: "white",
                    borderRadius: 20,
                    width: 32,
                    height: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                >
                  <Ionicons name="close" size={20} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* ── Scrollable Content ── */}
              <ScrollView
                style={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {/* 3-column grid */}
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Vehicle Type"  value={vehicle.title} />
                  </View>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Vehicle Number" value={vehicle.numberPlate} />
                  </View>

                  <View style={{ width: "33%" }}>
                    <DetailItem label="Model & Year"  value={`${vehicle.model || ""} ${vehicle.year || ""}`.trim()} />
                  </View>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Fuel Type"     value={vehicle.fuelType} />
                  </View>
                  <View style={{ width: "34%" }}>
                    <DetailItem label="Transmission"  value={vehicle.transmission} />
                  </View>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Price Per Day"  value={vehicle.pricePerDay ? `LKR ${vehicle.pricePerDay}` : "—"} />
                  </View>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Price Per KM"   value={vehicle.pricePerKm ? `LKR ${vehicle.pricePerKm}` : "—"} />
                  </View>
                  <View style={{ width: "34%" }}>
                    <DetailItem label="Location"      value={vehicle.location?.address} />
                  </View>
                  <View style={{ width: "33%" }}>
                    <DetailItem label="Seats"         value={vehicle.seats ? `${vehicle.seats} Seats` : "—"} />
                  </View>
                  <View style={{ width: "67%", paddingBottom: 16 }}>
                    <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>Rating</Text>
                    <StarRating rating={vehicle.rating ?? 0} />
                  </View>
                </View>

                {/* Operation Areas */}
                {vehicle.operationAreas?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
                      Operation Areas
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {vehicle.operationAreas.map((area, i) => (
                        <View key={i} style={{
                          borderWidth: 1,
                          borderColor: "#93C5FD",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}>
                          <Text style={{ color: "#1D4ED8", fontSize: 13 }}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Documents */}
                {vehicle.documents?.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
                      Document Submitted
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                      {vehicle.documents.map((doc, i) => (
                        <View key={i} style={{
                          backgroundColor: "#D1FAE5",
                          borderRadius: 20,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}>
                          <Text style={{ color: "#065F46", fontSize: 13 }}>{doc}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 16 }} />

                {/* Status banner */}
                <View style={{
                  backgroundColor: vehicle.status === "Approved" ? "#D1FAE5" : vehicle.status === "Rejected" ? "#FEE2E2" : "#FEF3C7",
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 8,
                  gap: 8,
                }}>
                  <Ionicons
                    name={vehicle.status === "Approved" ? "checkmark-circle" : vehicle.status === "Rejected" ? "close-circle" : "time"}
                    size={20}
                    color={statusColor}
                  />
                  <Text style={{ color: statusColor, fontWeight: "700", fontSize: 15 }}>
                    {vehicle.status === "Approved"
                      ? `Approved${vehicle.approvedAt ? ` on ${new Date(vehicle.approvedAt).toISOString().split("T")[0]}` : ""}`
                      : vehicle.status === "Rejected"
                      ? "Rejected"
                      : "Pending Approval"}
                  </Text>
                </View>

                <View style={{ height: 8 }} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── VehicleCard ──────────────────────────────────────────────────────────────
export default function VehicleCard({
  vehicle,
  onViewDetails,
  onManage,
  onAvailability,
  onDelete,
}) {
  const [detailVisible, setDetailVisible] = useState(false);

  const iconSize   = isSmallScreen ? 16 : 18;
  const imageSize  = isSmallScreen ? 100 : 115;

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
    <>
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
          {/* View Details → opens modal */}
          <TouchableOpacity
            className="flex-1 bg-[#0A2E5C] rounded-lg justify-center items-center"
            style={{ paddingVertical: isSmallScreen ? 5 : 7 }}
            onPress={() => setDetailVisible(true)}
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

      {/* Detail Modal */}
      <VehicleDetailModal
        vehicle={vehicle}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </>
  );
}