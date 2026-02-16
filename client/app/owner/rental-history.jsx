import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 414;
const numColumns = width > 600 ? 2 : 1; // For tablet support

// Mock data for rental history
const RENTALS = [
  {
    id: "1",
    vehicleName: "Mercedes-Benz S-Class",
    ownerName: "Piyal Siripala Zoysa",
    registrationNo: "ABC-0001",
    seats: "4 Seats",
    transmission: "Automatic",
    fuelType: "Petrol",
    renterName: "John Doe",
    renterPhone: "+94 00 0000 000",
    renterEmail: "johndoe@gmail.com",
    licenseNo: "B00000111",
    pickupDate: "Jan 10, 2026",
    pickupTime: "10:00 AM",
    returnDate: "Jan 15, 2026",
    returnTime: "10:00 AM",
    baseRent: 40000,
    insurance: 2000,
    serviceTax: 3000,
    totalAmount: 45000,
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    vehicleName: "Toyota Fortuner",
    ownerName: "Sunil Siriwardhana",
    registrationNo: "XYZ-0002",
    seats: "7 Seats",
    transmission: "Manual",
    fuelType: "Diesel",
    renterName: "Jane Smith",
    renterPhone: "+94 00 1111 111",
    renterEmail: "jane.smith@gmail.com",
    licenseNo: "B00000222",
    pickupDate: "Jan 08, 2026",
    pickupTime: "09:00 AM",
    returnDate: "Jan 12, 2026",
    returnTime: "09:00 AM",
    baseRent: 25000,
    insurance: 1500,
    serviceTax: 500,
    totalAmount: 27000,
    status: "Canceled",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    vehicleName: "BMW M4",
    ownerName: "Tharindu Sanjeewa",
    registrationNo: "BMW-0003",
    seats: "2 Seats",
    transmission: "Automatic",
    fuelType: "Petrol",
    renterName: "Mike Wilson",
    renterPhone: "+94 00 2222 222",
    renterEmail: "mike.wilson@gmail.com",
    licenseNo: "B00000333",
    pickupDate: "Feb 01, 2026",
    pickupTime: "08:00 AM",
    returnDate: "Feb 05, 2026",
    returnTime: "08:00 AM",
    baseRent: 35000,
    insurance: 2500,
    serviceTax: 500,
    totalAmount: 38000,
    status: "Ongoing",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    vehicleName: "Maruti Suzuki",
    ownerName: "Somasiri Udawalaththa",
    registrationNo: "CAR-0004",
    seats: "5 Seats",
    transmission: "Manual",
    fuelType: "Petrol",
    renterName: "Sarah Davis",
    renterPhone: "+94 00 3333 333",
    renterEmail: "sarah.davis@gmail.com",
    licenseNo: "B00000444",
    pickupDate: "Jan 20, 2026",
    pickupTime: "11:00 AM",
    returnDate: "Jan 25, 2026",
    returnTime: "11:00 AM",
    baseRent: 15000,
    insurance: 1000,
    serviceTax: 2000,
    totalAmount: 18000,
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    vehicleName: "Toyota NOAH Old Model",
    ownerName: "Asiri Dahansala",
    registrationNo: "OLD-0005",
    seats: "8 Seats",
    transmission: "Automatic",
    fuelType: "Hybrid",
    renterName: "Tom Brown",
    renterPhone: "+94 00 4444 444",
    renterEmail: "tom.brown@gmail.com",
    licenseNo: "B00000555",
    pickupDate: "Jan 28, 2026",
    pickupTime: "02:00 PM",
    returnDate: "Feb 02, 2026",
    returnTime: "02:00 PM",
    baseRent: 22000,
    insurance: 1500,
    serviceTax: 1500,
    totalAmount: 25000,
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
  },
];

const RentalCard = ({ rental, onPress }) => {
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

  const cardWidth = numColumns > 1 ? (width - 48) / 2 : width - 32;
  const imageSize = isSmallScreen ? 80 : 100;

  return (
    <TouchableOpacity
      className="bg-white rounded-lg mt-4"
      style={{
        width: cardWidth,
        marginHorizontal: numColumns > 1 ? 8 : 16,
        minHeight: isSmallScreen ? 140 : 160,
        shadowColor: "#2563EB", // Blue shadow color (matching header)
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
      onPress={() => onPress(rental)}
      activeOpacity={0.7}
    >
      <View className="flex-row p-4">
        {/* Left Side - Vehicle Photo */}
        <View className="mr-4">
          <Image
            source={{ uri: rental.image }}
            style={{
              width: imageSize,
              height: imageSize * 0.7,
              borderRadius: 12,
            }}
            contentFit="cover"
          />
        </View>

        {/* Right Side */}
        <View className="flex-1">
          {/* Top Section - Car name, Owner name, Date */}
          <View className="mb-4">
            <Text
              className={`font-bold text-gray-800  ${
                isSmallScreen
                  ? "text-base"
                  : isMediumScreen
                    ? "text-lg"
                    : "text-xl"
              }`}
              numberOfLines={2}
            >
              {rental.vehicleName}
            </Text>
            <Text
              className={`text-gray-600 mb-1 ${
                isSmallScreen ? "text-sm" : "text-base"
              }`}
              numberOfLines={1}
            >
              {rental.ownerName}
            </Text>
            <Text
              className={`text-gray-500 ${
                isSmallScreen ? "text-xs" : "text-sm"
              }`}
              numberOfLines={1}
            >
              {rental.pickupDate} - {rental.returnDate}
            </Text>
          </View>

          {/* Bottom Section */}
          <View className="flex-row justify-between items-center">
            {/* Left - Price */}
            <View className="flex-1 mr-3">
              <Text
                className={`font-bold text-blue-600 ${
                  isSmallScreen
                    ? "text-base"
                    : isMediumScreen
                      ? "text-lg"
                      : "text-xl"
                }`}
              >
                Rs. {rental.totalAmount.toLocaleString()}
              </Text>
            </View>

            {/* Right - Status with Icon */}
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
                  isSmallScreen ? "text-xs" : "text-sm"
                }`}
              >
                {rental.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function RentalHistoryScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [tempDateRange, setTempDateRange] = useState({
    start: null,
    end: null,
  });
  const [selectingStart, setSelectingStart] = useState(true);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredRentals = RENTALS.filter((rental) => {
    const matchesSearch =
      rental.vehicleName.toLowerCase().includes(searchText.toLowerCase()) ||
      rental.ownerName.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || rental.status === selectedStatus;

    // Date range filtering
    if (dateRange.start || dateRange.end) {
      const rentalStart = new Date(rental.pickupDate);
      const rentalEnd = new Date(rental.returnDate);

      // Check if rental period overlaps with selected date range
      if (dateRange.start && dateRange.end) {
        // Both start and end dates selected
        const overlapStart = new Date(
          Math.max(rentalStart.getTime(), dateRange.start.getTime()),
        );
        const overlapEnd = new Date(
          Math.min(rentalEnd.getTime(), dateRange.end.getTime()),
        );
        if (overlapStart > overlapEnd) return false; // No overlap
      } else if (dateRange.start) {
        // Only start date selected - show rentals that start on or after this date
        if (rentalStart < dateRange.start) return false;
      } else if (dateRange.end) {
        // Only end date selected - show rentals that start on or before this date
        if (rentalStart > dateRange.end) return false;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const handleDateSelect = (date) => {
    if (selectingStart) {
      setTempDateRange({ start: date, end: null });
      setSelectingStart(false);
    } else {
      if (date >= tempDateRange.start) {
        setTempDateRange((prev) => ({ ...prev, end: date }));
        setSelectingStart(true);
      } else {
        // If end date is before start date, reset and use as new start date
        setTempDateRange({ start: date, end: null });
      }
    }
  };

  const resetDateRange = () => {
    setTempDateRange({ start: null, end: null });
    setSelectingStart(true);
  };

  const applyDateRange = () => {
    setDateRange(tempDateRange);
    setShowDatePicker(false);
    setSelectingStart(true);
  };

  const closeDatePicker = () => {
    setTempDateRange(dateRange); // Reset to applied range
    setShowDatePicker(false);
    setSelectingStart(true);
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const generateCalendarDates = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatMonthYear = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[currentMonth]} ${currentYear}`;
  };

  const isDateInCurrentMonth = (date) => {
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  };

  const isDateSelected = (date) => {
    return (
      (tempDateRange.start &&
        date.toDateString() === tempDateRange.start.toDateString()) ||
      (tempDateRange.end &&
        date.toDateString() === tempDateRange.end.toDateString())
    );
  };

  const isDateInRange = (date) => {
    return (
      tempDateRange.start &&
      tempDateRange.end &&
      date >= tempDateRange.start &&
      date <= tempDateRange.end
    );
  };

  const openDatePicker = () => {
    setTempDateRange(dateRange); // Initialize with current range
    setShowDatePicker(true);
  };

  const openRentalDetails = (rental) => {
    setSelectedRental(rental);
    setShowRentalDetails(true);
  };

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

  const renderHeader = () => (
    <View
      className="bg-white border-b border-gray-200"
      style={{
        paddingHorizontal: 16,
        paddingTop: 8, // Reduced top padding
        paddingBottom: isSmallScreen ? 12 : 16,
      }}
    >
      {/* Search Bar */}
      <View className="mb-4 mt-2 flex-row items-center" style={{ gap: 8 }}>
        <TextInput
          className="bg-gray-100 rounded-lg text-gray-800 flex-1"
          style={{
            paddingHorizontal: 16,
            paddingVertical: isSmallScreen ? 12 : 14,
            fontSize: isSmallScreen ? 14 : 16,
            minHeight: Platform.OS === "ios" ? 44 : 48, // Platform-specific minimum touch target
          }}
          placeholder="Search vehicles or owners..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity
          className="bg-gray-100 rounded-lg items-center justify-center"
          style={{
            minHeight: Platform.OS === "ios" ? 44 : 48,
            minWidth: isSmallScreen ? 50 : 60,
            paddingHorizontal: 12,
          }}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={isSmallScreen ? 18 : 20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {["All", "Completed", "Ongoing", "Canceled"].map((status) => (
          <TouchableOpacity
            key={status}
            className={`rounded-full border ${
              selectedStatus === status
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-300"
            }`}
            style={{
              paddingHorizontal: isSmallScreen ? 12 : 16,
              paddingVertical: isSmallScreen ? 8 : 10,
              minHeight: Platform.OS === "ios" ? 36 : 40,
            }}
            onPress={() => setSelectedStatus(status)}
            activeOpacity={0.7}
          >
            <Text
              className={`font-medium ${
                selectedStatus === status ? "text-white" : "text-gray-600"
              } ${isSmallScreen ? "text-xs" : "text-sm"}`}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Date Range Display */}
      {(dateRange.start || dateRange.end) && (
        <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs font-medium text-blue-700 mb-1">
                Filtered by Date Range:
              </Text>
              <Text className="text-sm text-blue-900 font-medium">
                {dateRange.start
                  ? dateRange.start.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Start date"}{" "}
                -{" "}
                {dateRange.end
                  ? dateRange.end.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "End date"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setDateRange({ start: null, end: null });
                setTempDateRange({ start: null, end: null });
              }}
              className="ml-3 p-2"
            >
              <Ionicons name="close" size={16} color="#1D4ED8" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderRental = ({ item }) => (
    <RentalCard rental={item} onPress={openRentalDetails} />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      {/* Sticky Header */}
      {renderHeader()}

      {/* Scrollable Content */}
      <FlatList
        data={filteredRentals}
        key={numColumns} // Force re-render when columns change
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        renderItem={renderRental}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 20 : 16,
          flexGrow: 1,
        }}
        columnWrapperStyle={
          numColumns > 1 ? { justifyContent: "space-between" } : null
        }
        style={{ backgroundColor: "#f9fafb" }} // Light gray background only for the list area
      />

      {/* Date Range Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="fade"
        transparent={true}
        onRequestClose={closeDatePicker}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 p-4">
          <View className="bg-white rounded-xl shadow-lg w-full max-w-sm">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">
                Select Date Range
              </Text>
              <TouchableOpacity onPress={closeDatePicker}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {/* Month Navigation */}
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity
                  onPress={() => navigateMonth("prev")}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Ionicons name="chevron-back" size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800">
                  {formatMonthYear()}
                </Text>
                <TouchableOpacity
                  onPress={() => navigateMonth("next")}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Ionicons name="chevron-forward" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Weekday Headers */}
              <View className="flex-row mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <View key={day} className="flex-1 items-center py-2">
                      <Text className="text-sm font-medium text-gray-500">
                        {day}
                      </Text>
                    </View>
                  ),
                )}
              </View>

              {/* Calendar Grid */}
              <View className="mb-4">
                {Array.from({ length: 6 }, (_, weekIndex) => (
                  <View key={weekIndex} className="flex-row">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const dateIndex = weekIndex * 7 + dayIndex;
                      const calendarDates = generateCalendarDates();
                      const date = calendarDates[dateIndex];
                      const isCurrentMonth = isDateInCurrentMonth(date);
                      const isSelected = isDateSelected(date);
                      const isInRange = isDateInRange(date);

                      return (
                        <TouchableOpacity
                          key={dayIndex}
                          className={`flex-1 aspect-square items-center justify-center m-0.5 rounded ${
                            !isCurrentMonth
                              ? "opacity-30"
                              : isSelected
                                ? "bg-blue-500"
                                : isInRange
                                  ? "bg-blue-100"
                                  : "bg-transparent"
                          }`}
                          onPress={() =>
                            isCurrentMonth && handleDateSelect(date)
                          }
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? "text-white font-semibold"
                                : isInRange
                                  ? "text-blue-700 font-medium"
                                  : !isCurrentMonth
                                    ? "text-gray-300"
                                    : "text-gray-900"
                            }`}
                          >
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Selected Date Range Display */}
              {(tempDateRange.start || tempDateRange.end) && (
                <View className="p-3 bg-gray-50 rounded-lg mb-4">
                  <Text className="text-xs font-medium text-gray-700 mb-1">
                    Selected Range:
                  </Text>
                  <Text className="text-sm text-gray-800">
                    {tempDateRange.start
                      ? tempDateRange.start.toLocaleDateString()
                      : "Select start"}{" "}
                    -{" "}
                    {tempDateRange.end
                      ? tempDateRange.end.toLocaleDateString()
                      : "Select end"}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={resetDateRange}
                  className="flex-1 py-3 bg-gray-100 rounded-lg items-center"
                >
                  <Text className="text-gray-700 font-medium">Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={applyDateRange}
                  className="flex-1 py-3 bg-blue-500 rounded-lg items-center"
                >
                  <Text className="text-white font-medium">Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rental Details Modal */}
      <Modal
        visible={showRentalDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRentalDetails(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-lg" style={{ maxHeight: "100%" }}>
            {selectedRental && (
              <>
                {/* Modal Header */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                  <Text className="text-lg font-semibold text-gray-800">
                    Rental Details
                  </Text>
                  <TouchableOpacity onPress={() => setShowRentalDetails(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Hero Image */}
                  <Image
                    source={{ uri: selectedRental.image }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                  />

                  {/* Content */}
                  <View className="p-4">
                    {/* Header Section */}
                    <View className="flex-row justify-between items-start mb-6">
                      <View className="flex-1 mr-4">
                        <Text className="text-xl font-bold text-gray-800 mb-2">
                          {selectedRental.vehicleName}
                        </Text>
                      </View>
                      <View
                        className={`px-3 py-2 rounded-full ${getStatusStyle(selectedRental.status)}`}
                      >
                        <Text className="text-sm font-semibold">
                          {selectedRental.status}
                        </Text>
                      </View>
                    </View>

                    {/* Info Grid */}
                    <View className="bg-gray-50 rounded-lg p-4 mb-6">
                      <View className="flex-row">
                        {/* Vehicle Information */}
                        <View className="flex-1 pr-2">
                          <Text className="text-base font-semibold text-gray-800 mb-3">
                            VEHICLE INFO
                          </Text>
                          <InfoRow
                            label="Registration"
                            value={selectedRental.registrationNo}
                          />
                          <InfoRow label="Seats" value={selectedRental.seats} />
                          <InfoRow
                            label="Transmission"
                            value={selectedRental.transmission}
                          />
                          <InfoRow
                            label="Fuel Type"
                            value={selectedRental.fuelType}
                          />
                        </View>

                        {/* Renter Information */}
                        <View className="flex-1 pl-2">
                          <Text className="text-base font-semibold text-gray-800 mb-3">
                            RENTER INFO
                          </Text>
                          <InfoRow
                            label="Name"
                            value={selectedRental.renterName}
                          />
                          <InfoRow
                            label="Phone"
                            value={selectedRental.renterPhone}
                          />
                          <InfoRow
                            label="License"
                            value={selectedRental.licenseNo}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Rental Period */}
                    <View className="bg-gray-50 rounded-lg p-4 mb-6">
                      <Text className="text-base font-semibold text-gray-800 mb-3">
                        RENTAL PERIOD
                      </Text>
                      <View className="flex-row justify-between">
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600 mb-1">
                            Pickup
                          </Text>
                          <Text className="text-sm font-medium text-gray-800">
                            {selectedRental.pickupDate} •{" "}
                            {selectedRental.pickupTime}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs text-gray-600 mb-1">
                            Return
                          </Text>
                          <Text className="text-sm font-medium text-gray-800">
                            {selectedRental.returnDate} •{" "}
                            {selectedRental.returnTime}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Payment Details */}
                    <View className="bg-gray-50 rounded-lg p-4 mb-6">
                      <Text className="text-base font-semibold text-gray-800 mb-3">
                        PAYMENT DETAILS
                      </Text>
                      <PaymentRow
                        label="Base Rent"
                        amount={selectedRental.baseRent}
                      />
                      <PaymentRow
                        label="Insurance"
                        amount={selectedRental.insurance}
                      />
                      <PaymentRow
                        label="Service Tax"
                        amount={selectedRental.serviceTax}
                      />
                      <View className="border-t border-gray-300 mt-2 pt-2">
                        <PaymentRow
                          label="Total Amount"
                          amount={selectedRental.totalAmount}
                          isTotal={true}
                        />
                      </View>
                    </View>

                    {/* Success Banner */}
                    {selectedRental.status === "Completed" && (
                      <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                        <Text className="text-green-800 font-medium ml-2 flex-1 text-sm">
                          Payment completed successfully
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View className="bg-white border-t border-gray-200 p-4">
                  <TouchableOpacity
                    className="bg-blue-600 py-3 rounded-lg mb-3 flex-row justify-center items-center"
                    onPress={handleDownloadInvoice}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download" size={16} color="white" />
                    <Text className="text-white font-semibold text-sm ml-2">
                      Download Invoice
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-blue-600 py-3 rounded-lg flex-row justify-center items-center"
                    onPress={handleDownloadDocuments}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document" size={16} color="white" />
                    <Text className="text-white font-semibold text-sm ml-2">
                      Download Documents
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoRow = ({ label, value }) => (
  <View className="mb-2">
    <Text className="text-xs text-gray-600 mb-1">{label}</Text>
    <Text className="text-sm text-gray-800 font-medium" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const PaymentRow = ({ label, amount, isTotal = false }) => (
  <View className="flex-row justify-between items-center mb-1">
    <Text
      className={`text-gray-800 flex-1 mr-2 ${
        isTotal ? "text-sm font-semibold" : "text-sm"
      }`}
      numberOfLines={1}
    >
      {label}
    </Text>
    <Text
      className={`${
        isTotal ? "text-sm font-bold text-blue-600" : "text-sm text-gray-800"
      }`}
    >
      Rs. {amount.toLocaleString()}
    </Text>
  </View>
);
