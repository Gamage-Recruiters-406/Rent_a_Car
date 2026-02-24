import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getBookingById } from "../../services/ownerApi";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 414;
const isTablet = width > 600;

export default function RentalDetailsScreen() {
  const { rentalId } = useLocalSearchParams();
  const router = useRouter();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!rentalId) return;
    let isMounted = true;
    const loadBooking = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await getBookingById(rentalId);
        if (isMounted) setRental(data);
      } catch (err) {
        if (isMounted) setFetchError(err.message || "Failed to load booking");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadBooking();
    return () => {
      isMounted = false;
    };
  }, [rentalId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#0A2E5C" />
        <Text className="text-gray-500 mt-4">Loading booking details…</Text>
      </SafeAreaView>
    );
  }

  if (fetchError || !rental) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-8">
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 text-center mt-4">
          {fetchError || "Rental not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "checkmark-circle";
      case "Canceled":
        return "close-circle";
      case "Ongoing":
        return "time";
      default:
        return "help-circle";
    }
  };

  const getStatusIconColor = (status) => {
    switch (status) {
      case "Completed":
        return "#10B981";
      case "Canceled":
        return "#EF4444";
      case "Ongoing":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const handleDownloadInvoice = () => {
    Alert.alert(
      "Download Invoice",
      "Invoice download functionality will be implemented here.",
    );
  };

  const handleDownloadDocuments = () => {
    Alert.alert(
      "Download Documents",
      "Documents download functionality will be implemented here.",
    );
  };

  const heroImageHeight = isSmallScreen ? 200 : isMediumScreen ? 240 : 280;
  const horizontalPadding = isTablet ? 24 : isSmallScreen ? 12 : 16;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 " edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: rental.image }}
            style={{
              width: "100%",
              height: heroImageHeight,
            }}
            contentFit="cover"
          />
        </View>

        {/* Content */}
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            paddingVertical: isSmallScreen ? 16 : 24,
          }}
        >
          {/* Header Section */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 mr-4">
              <Text
                className={`font-bold text-gray-800 mb-2 ${
                  isSmallScreen
                    ? "text-xl"
                    : isMediumScreen
                      ? "text-2xl"
                      : "text-3xl"
                }`}
                numberOfLines={2}
              >
                {rental.vehicleName}
              </Text>
            </View>
            <View
              className={`px-3 py-2 rounded-full flex-row items-center ${getStatusStyle(rental.status)}`}
            >
              <Ionicons
                name={getStatusIcon(rental.status)}
                size={isSmallScreen ? 14 : 16}
                color={getStatusIconColor(rental.status)}
                style={{ marginRight: 4 }}
              />
              <Text
                className={`font-semibold ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                {rental.status}
              </Text>
            </View>
          </View>

          {/* Info Grid */}
          <View
            className="bg-white rounded-lg shadow-sm mb-6"
            style={{
              padding: isSmallScreen ? 12 : 16,
            }}
          >
            <View className={isTablet ? "flex-row" : "flex-col"}>
              {/* Vehicle Information */}
              <View className={`${isTablet ? "flex-1 pr-4" : "mb-6"}`}>
                <Text
                  className={`font-semibold text-gray-800 mb-3 ${
                    isSmallScreen ? "text-base" : "text-lg"
                  }`}
                >
                  VEHICLE INFORMATION
                </Text>
                <InfoRow label="Name" value={rental.vehicleName} />
                <InfoRow
                  label="Registration No"
                  value={rental.registrationNo}
                />
                <InfoRow label="Seats" value={rental.seats} />
                <InfoRow label="Transmission" value={rental.transmission} />
                <InfoRow label="Fuel Type" value={rental.fuelType} />
              </View>

              {/* Renter Information */}
              <View
                className={`${isTablet ? "flex-1 pl-4 border-l border-gray-200" : ""}`}
              >
                <Text
                  className={`font-semibold text-gray-800 mb-3 ${
                    isSmallScreen ? "text-base" : "text-lg"
                  }`}
                >
                  RENTER INFORMATION
                </Text>
                <InfoRow label="Name" value={rental.renterName} />
                <InfoRow label="Phone" value={rental.renterPhone} />
                <InfoRow label="Email" value={rental.renterEmail} />
                <InfoRow label="License No" value={rental.licenseNo} />
              </View>
            </View>
          </View>

          {/* Rental Period */}
          <View
            className="bg-gray-100 rounded-lg mb-6"
            style={{
              padding: isSmallScreen ? 12 : 16,
            }}
          >
            <Text
              className={`font-semibold text-gray-800 mb-4 ${
                isSmallScreen ? "text-base" : "text-lg"
              }`}
            >
              RENTAL PERIOD
            </Text>
            <View
              className={
                isSmallScreen ? "flex-col" : "flex-row justify-between"
              }
            >
              <View className={`${isSmallScreen ? "mb-4" : "flex-1"}`}>
                <Text
                  className={`text-gray-600 mb-1 ${
                    isSmallScreen ? "text-sm" : "text-base"
                  }`}
                >
                  Pickup Date & Time
                </Text>
                <Text
                  className={`font-medium text-gray-800 ${
                    isSmallScreen ? "text-sm" : "text-base"
                  }`}
                >
                  {rental.pickupDate} • {rental.pickupTime}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`text-gray-600 mb-1 ${
                    isSmallScreen ? "text-sm" : "text-base"
                  }`}
                >
                  Return Date & Time
                </Text>
                <Text
                  className={`font-medium text-gray-800 ${
                    isSmallScreen ? "text-sm" : "text-base"
                  }`}
                >
                  {rental.returnDate} • {rental.returnTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Details */}
          <View
            className="bg-white rounded-lg shadow-sm mb-6"
            style={{
              padding: isSmallScreen ? 12 : 16,
            }}
          >
            <Text
              className={`font-semibold text-gray-800 mb-4 ${
                isSmallScreen ? "text-base" : "text-lg"
              }`}
            >
              PAYMENT DETAILS
            </Text>
            <PaymentRow label="Base Rent (5 days)" amount={rental.baseRent} />
            <PaymentRow label="Insurance" amount={rental.insurance} />
            <PaymentRow label="Service Tax (18%)" amount={rental.serviceTax} />
            <View className="border-t border-gray-200 mt-2 pt-2">
              <PaymentRow
                label="Total Amount"
                amount={rental.totalAmount}
                isTotal={true}
              />
            </View>
          </View>

          {/* Success Banner */}
          {rental.status === "Completed" && (
            <View
              className="bg-green-50 border border-green-200 rounded-lg flex-row items-center mb-6"
              style={{
                padding: isSmallScreen ? 12 : 16,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={isSmallScreen ? 20 : 24}
                color="#10B981"
              />
              <Text
                className={`text-green-800 font-medium ml-2 flex-1 ${
                  isSmallScreen ? "text-sm" : "text-base"
                }`}
              >
                Payment completed successfully
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        className="bg-white border-t border-gray-200"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingVertical: isSmallScreen ? 12 : 16,
          paddingBottom: Platform.OS === "ios" ? 24 : 16, // Extra bottom padding for iOS
        }}
      >
        <TouchableOpacity
          className="bg-[#0A2E5C] rounded-lg mb-3 flex-row justify-center items-center"
          style={{
            paddingVertical: isSmallScreen ? 12 : 16,
            minHeight: Platform.OS === "ios" ? 44 : 48, // Platform-specific minimum touch target
          }}
          onPress={handleDownloadInvoice}
          activeOpacity={0.8}
        >
          <Ionicons
            name="download"
            size={isSmallScreen ? 16 : 20}
            color="white"
          />
          <Text
            className={`text-white font-semibold ml-2 ${
              isSmallScreen ? "text-sm" : "text-lg"
            }`}
          >
            Download Invoice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#0A2E5C] rounded-lg flex-row justify-center items-center"
          style={{
            paddingVertical: isSmallScreen ? 12 : 16,
            minHeight: Platform.OS === "ios" ? 44 : 48, // Platform-specific minimum touch target
          }}
          onPress={handleDownloadDocuments}
          activeOpacity={0.8}
        >
          <Ionicons
            name="document"
            size={isSmallScreen ? 16 : 20}
            color="white"
          />
          <Text
            className={`text-white font-semibold ml-2 ${
              isSmallScreen ? "text-sm" : "text-lg"
            }`}
          >
            Download Documents
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View className="mb-3">
    <Text
      className={`text-gray-600 mb-1 ${isSmallScreen ? "text-sm" : "text-base"}`}
    >
      {label}
    </Text>
    <Text
      className={`text-gray-800 font-medium ${
        isSmallScreen ? "text-base" : "text-lg"
      }`}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const PaymentRow = ({ label, amount, isTotal = false }) => (
  <View className="flex-row justify-between items-center mb-2">
    <Text
      className={`text-gray-800 flex-1 mr-2 ${
        isTotal
          ? isSmallScreen
            ? "text-base font-semibold"
            : "text-lg font-semibold"
          : isSmallScreen
            ? "text-sm"
            : "text-base"
      }`}
      numberOfLines={1}
    >
      {label}
    </Text>
    <Text
      className={`${
        isTotal
          ? isSmallScreen
            ? "text-base font-bold text-blue-600"
            : "text-lg font-bold text-blue-600"
          : isSmallScreen
            ? "text-sm text-gray-800"
            : "text-base text-gray-800"
      }`}
    >
      Rs. {amount.toLocaleString()}
    </Text>
  </View>
);
