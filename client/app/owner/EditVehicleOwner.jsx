import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// import * as Location from "expo-location";            // MAP: commented out - uncomment for mobile map
// import MapView, { Marker } from "react-native-maps"; // MAP: commented out - uncomment for mobile map
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "../../config/env";
import AppLayout from "../../components/layout/Layout";

const API_BASE_URL = ENV.API_BASE_URL;

// ── Dropdown options ──
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid"];
const TRANSMISSION_TYPES = ["Automatic", "Manual"];
const YEARS = Array.from({ length: 30 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);

// ────────────────────────────────────────────
// Reusable DropdownPicker component
// ────────────────────────────────────────────
const DropdownPicker = ({
  label,
  required,
  options,
  value,
  onSelect,
  placeholder,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: "#0D3778",
          fontWeight: "600",
          fontSize: 14,
          marginBottom: 6,
        }}
      >
        {label} {required && <Text style={{ color: "#EF4444" }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={{
          borderWidth: 2,
          borderColor: disabled ? "#D1D5DB" : "#0D3778",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: disabled ? "#F3F4F6" : "#FFFFFF",
        }}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={{ color: value ? "#1F2937" : "#9CA3AF", flex: 1 }}>
          {value || placeholder || `Select ${label}`}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={disabled ? "#9CA3AF" : "#0D3778"}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "60%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#0D3778" }}
              >
                Select {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 8,
                    marginHorizontal: 8,
                    marginBottom: 4,
                    backgroundColor: value === opt ? "#EFF6FF" : "transparent",
                  }}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: value === opt ? "#1D4ED8" : "#374151",
                      fontWeight: value === opt ? "600" : "400",
                    }}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── Read-only field ──
const ReadOnlyField = ({ label, value, placeholder }) => (
  <View style={{ marginBottom: 16 }}>
    <Text
      style={{
        color: "#0D3778",
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 6,
      }}
    >
      {label}
    </Text>
    <View
      style={{
        borderWidth: 2,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "#F3F4F6",
      }}
    >
      <Text style={{ color: "#6B7280" }}>{value || placeholder || ""}</Text>
    </View>
  </View>
);

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
export default function EditVehicleOwnerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const mapRef = useRef(null); // MAP: keep ref - used when map modal is re-enabled

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  // const [showMap, setShowMap] = useState(false); // MAP: commented out - uncomment for mobile map modal
  const [replacePhotos, setReplacePhotos] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    model: "",
    vehicleType: "",
    year: "",
    fuelType: "",
    description: "",
    numberPlate: "",
    km: "",
    seats: "",
    pricePerDay: "",
    pricePerKm: "",
    transmission: "",
    address: "",
  });

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [originalPhotoCount, setOriginalPhotoCount] = useState(0);
  const [newPhotos, setNewPhotos] = useState([]);

  // MAP: selectedLocation state - kept for when map is re-enabled
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 6.9271,
    lng: 79.8612,
    address: "",
  });

  // ── Fetch vehicle data on mount ──
  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      setFetchingData(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/vehicle/get/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch vehicle data");
      }

      const vehicle = data.vehicle;

      setFormData({
        title: vehicle.title || "",
        model: vehicle.model || "",
        vehicleType: vehicle.vehicleType || "",
        year: vehicle.year || "",
        fuelType: vehicle.fuelType || "",
        description: vehicle.description || "",
        numberPlate: vehicle.numberPlate || "",
        km: vehicle.km?.toString() || "",
        seats: vehicle.seats?.toString() || "",
        pricePerDay: vehicle.pricePerDay?.toString() || "",
        pricePerKm: vehicle.pricePerKm?.toString() || "",
        transmission: vehicle.transmission || "",
        address: vehicle.location?.address || "",
      });

      setExistingPhotos(vehicle.photos || []);
      setOriginalPhotoCount((vehicle.photos || []).length);

      if (vehicle.location?.geo?.coordinates) {
        const [lng, lat] = vehicle.location.geo.coordinates;
        setSelectedLocation({
          lat,
          lng,
          address: vehicle.location.address || "",
        });
      }
    } catch (error) {
      console.error("Fetch vehicle error:", error);
      Alert.alert("Error", error.message || "Could not load vehicle data.", [
        { text: "Go Back", onPress: () => router.back() },
      ]);
    } finally {
      setFetchingData(false);
    }
  };

  const updateField = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // ── Image Picker ──
  const pickNewPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      if (result.assets.length > 10) {
        Alert.alert("Limit Exceeded", "Maximum 10 photos allowed.");
        return;
      }
      setNewPhotos(result.assets);
    }
  };

  const removeNewPhoto = (index) =>
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));

  const removeExistingPhoto = (index) => {
    const updated = existingPhotos.filter((_, i) => i !== index);
    setExistingPhotos(updated);
    if (updated.length < originalPhotoCount) {
      setReplacePhotos(true);
      Alert.alert(
        "Replace Mode Enabled",
        "Since you removed existing photos, new photos will replace all existing photos when you save.",
      );
    }
  };

  // ══════════════════════════════════════════════════════════════
  // MAP FUNCTIONS — all commented out
  // To re-enable map on mobile:
  //   1. Uncomment imports at top (Location, MapView, Marker)
  //   2. Uncomment showMap state above
  //   3. Uncomment all functions below
  //   4. Uncomment the map icon button in Location section
  //   5. Uncomment the Map Modal at the bottom
  //   6. In submitForm, swap default coords for selectedLocation.lat/lng
  // ══════════════════════════════════════════════════════════════

  // const updateLocationFromCoordinates = async (lat, lng) => {
  //     setSelectedLocation((prev) => ({ ...prev, lat, lng }));
  //     try {
  //         const { status } = await Location.requestForegroundPermissionsAsync();
  //         if (status !== "granted") {
  //             const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  //             setSelectedLocation({ lat, lng, address: fallback });
  //             updateField("address", fallback);
  //             return;
  //         }
  //         const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
  //         if (result) {
  //             const parts = [result.street, result.city, result.region, result.country].filter(Boolean);
  //             const address = parts.join(", ");
  //             setSelectedLocation({ lat, lng, address });
  //             updateField("address", address);
  //         } else {
  //             const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  //             setSelectedLocation({ lat, lng, address: fallback });
  //             updateField("address", fallback);
  //         }
  //     } catch (e) {
  //         const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  //         setSelectedLocation({ lat, lng, address: fallback });
  //         updateField("address", fallback);
  //     }
  // };

  // const handleMapPress = (e) => {
  //     const { latitude, longitude } = e.nativeEvent.coordinate;
  //     updateLocationFromCoordinates(latitude, longitude);
  // };

  // const handleMarkerDragEnd = (e) => {
  //     const { latitude, longitude } = e.nativeEvent.coordinate;
  //     updateLocationFromCoordinates(latitude, longitude);
  // };

  // const getCurrentLocation = async () => {
  //     try {
  //         const { status } = await Location.requestForegroundPermissionsAsync();
  //         if (status !== "granted") {
  //             Alert.alert("Permission Denied", "Location permission is required.");
  //             return;
  //         }
  //         const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  //         const { latitude, longitude } = location.coords;
  //         await updateLocationFromCoordinates(latitude, longitude);
  //         mapRef.current?.animateToRegion({
  //             latitude,
  //             longitude,
  //             latitudeDelta: 0.01,
  //             longitudeDelta: 0.01,
  //         });
  //     } catch (e) {
  //         Alert.alert("Error", "Could not get current location.");
  //     }
  // };

  // ══════════════════════════════════════════════════════════════
  // END MAP FUNCTIONS
  // ══════════════════════════════════════════════════════════════

  // ── Validation & Submit ──
  const handleSubmit = () => {
    const requiredFields = [
      "year",
      "fuelType",
      "description",
      "km",
      "seats",
      "pricePerDay",
      "pricePerKm",
      "transmission",
      "address",
    ];
    const missing = requiredFields.find((f) => !formData[f]);
    if (missing) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }

    if (replacePhotos) {
      if (newPhotos.length === 0) {
        Alert.alert(
          "Validation",
          "Please upload new photos to replace existing ones.",
        );
        return;
      }
    } else {
      if (existingPhotos.length === 0 && newPhotos.length === 0) {
        Alert.alert(
          "Validation",
          "Please keep at least 1 photo or upload new photos.",
        );
        return;
      }
    }

    submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const body = new FormData();

      body.append("year", formData.year);
      body.append("fuelType", formData.fuelType);
      body.append("description", formData.description);
      body.append("km", formData.km);
      body.append("seats", formData.seats);
      body.append("pricePerDay", formData.pricePerDay);
      body.append("pricePerKm", formData.pricePerKm);
      body.append("transmission", formData.transmission);
      body.append("address", formData.address);

      // MAP: sending existing location coordinates while map is disabled
      // When re-enabling map, replace these two lines with:
      // body.append("lat", selectedLocation.lat);
      // body.append("lng", selectedLocation.lng);
      body.append("lat", selectedLocation.lat);
      body.append("lng", selectedLocation.lng);

      body.append("replacePhotos", replacePhotos.toString());

      newPhotos.forEach((photo, idx) => {
        const uri = photo.uri;
        const name = uri.split("/").pop() || `photo_${idx}.jpg`;
        const type = name.endsWith(".png") ? "image/png" : "image/jpeg";
        body.append("photos", { uri, name, type });
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/vehicle/update/${id}`,
        {
          method: "PUT",
          body,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update vehicle");

      Alert.alert("Success", "Vehicle updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // LOADING STATE
  // ────────────────────────────────────────────
  if (fetchingData) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F3F4F6",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#0D3778" />
        <Text style={{ marginTop: 16, color: "#6B7280", fontSize: 14 }}>
          Loading vehicle data...
        </Text>
      </SafeAreaView>
    );
  }

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <AppLayout user={null}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#F3F4F6" }}
        edges={["bottom"]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ─── Card Container ─── */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
                borderWidth: 2,
                borderColor: "#0D3778",
              }}
            >
              {/* Header */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#0D3778",
                    marginBottom: 4,
                  }}
                >
                  Edit Vehicle Details
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                  Update your vehicle information and manage your listing
                </Text>
              </View>

              {/* ─── Read-only fields ─── */}
              <ReadOnlyField
                label="Vehicle Title"
                value={formData.title}
                placeholder="e.g., Toyota Camry 2020"
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <ReadOnlyField
                    label="Vehicle Model"
                    value={formData.model}
                    placeholder="e.g., Toyota"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ReadOnlyField
                    label="Vehicle Type"
                    value={formData.vehicleType}
                    placeholder="—"
                  />
                </View>
              </View>

              {/* ─── Year & Fuel ─── */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <DropdownPicker
                    label="Year"
                    required
                    options={YEARS}
                    value={formData.year}
                    onSelect={(v) => updateField("year", v)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DropdownPicker
                    label="Fuel Type"
                    required
                    options={FUEL_TYPES}
                    value={formData.fuelType}
                    onSelect={(v) => updateField("fuelType", v)}
                  />
                </View>
              </View>

              {/* ─── Description ─── */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: "#0D3778",
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                >
                  Description
                </Text>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: "#0D3778",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: "#1F2937",
                    backgroundColor: "#FFFFFF",
                    minHeight: 90,
                    textAlignVertical: "top",
                  }}
                  placeholder="Describe features, condition, mileage, special amenities..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.description}
                  onChangeText={(v) => updateField("description", v)}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* ─── Number Plate / KM / Seats ─── */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 2 }}>
                  <ReadOnlyField
                    label="Number Plate"
                    value={formData.numberPlate}
                    placeholder="WP/AB 1234"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#0D3778",
                      fontWeight: "600",
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    KM <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: "#0D3778",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: "#1F2937",
                      backgroundColor: "#FFFFFF",
                      width: "100%",
                    }}
                    placeholder="50000"
                    placeholderTextColor="#9CA3AF"
                    value={formData.km}
                    onChangeText={(v) => updateField("km", v)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#0D3778",
                      fontWeight: "600",
                      fontSize: 14,
                      marginBottom: 6,
                    }}
                  >
                    Seats <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 2,
                      borderColor: "#0D3778",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: "#1F2937",
                      backgroundColor: "#FFFFFF",
                      width: "100%",
                    }}
                    placeholder="5"
                    placeholderTextColor="#9CA3AF"
                    value={formData.seats}
                    onChangeText={(v) => updateField("seats", v)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* ─── Rental Amount ─── */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: "#0D3778",
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Rental Amount <Text style={{ color: "#EF4444" }}>*</Text>
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      Daily Rental Rate
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 2,
                        borderColor: "#0D3778",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: "#1F2937",
                        backgroundColor: "#FFFFFF",
                        width: "100%",
                      }}
                      placeholder="e.g., 5000"
                      placeholderTextColor="#9CA3AF"
                      value={formData.pricePerDay}
                      onChangeText={(v) => updateField("pricePerDay", v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      Per Kilometer Charge
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 2,
                        borderColor: "#0D3778",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: "#1F2937",
                        backgroundColor: "#FFFFFF",
                        width: "100%",
                      }}
                      placeholder="e.g., 50"
                      placeholderTextColor="#9CA3AF"
                      value={formData.pricePerKm}
                      onChangeText={(v) => updateField("pricePerKm", v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* ─── Transmission ─── */}
              <DropdownPicker
                label="Transmission"
                required
                options={TRANSMISSION_TYPES}
                value={formData.transmission}
                onSelect={(v) => updateField("transmission", v)}
              />

              {/* ─── Location — manual text input only (map picker commented out) ─── */}
              {/* MAP: when re-enabling map, restore the flex-row wrapper + icon button:
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <TextInput style={{ flex: 1, ... }} ... />
                            <TouchableOpacity
                                style={{ backgroundColor: "#0D3778", borderRadius: 8, paddingHorizontal: 14, justifyContent: "center", alignItems: "center" }}
                                onPress={() => setShowMap(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="location" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                        */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: "#0D3778",
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 6,
                  }}
                >
                  Location <Text style={{ color: "#EF4444" }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 2,
                    borderColor: "#0D3778",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: "#1F2937",
                    backgroundColor: "#FFFFFF",
                  }}
                  placeholder="Enter your location (e.g., Colombo, Sri Lanka)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.address}
                  onChangeText={(v) => updateField("address", v)}
                />
              </View>

              {/* ─── Existing Photos ─── */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: "#0D3778",
                    fontWeight: "600",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Vehicle Photos
                </Text>

                {existingPhotos.length > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name="images" size={18} color="#0D3778" />
                      <Text
                        style={{
                          color: "#0D3778",
                          fontWeight: "600",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        Current Photos: {existingPhotos.length}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {existingPhotos.map((photo, index) => (
                        <View key={index} style={{ position: "relative" }}>
                          <Image
                            source={{ uri: `${API_BASE_URL}${photo.url}` }}
                            style={{ width: 72, height: 72, borderRadius: 8 }}
                            contentFit="cover"
                          />
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              backgroundColor: "#EF4444",
                              borderRadius: 10,
                              width: 20,
                              height: 20,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onPress={() => removeExistingPhoto(index)}
                          >
                            <Ionicons name="close" size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* ── Replace toggle ── */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  }}
                >
                  <Text
                    style={{
                      color: "#374151",
                      fontSize: 13,
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    Replace all existing photos with new uploads
                  </Text>
                  <Switch
                    value={replacePhotos}
                    onValueChange={(val) => setReplacePhotos(val)}
                    trackColor={{ false: "#D1D5DB", true: "#0D3778" }}
                    thumbColor={replacePhotos ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>

                {replacePhotos && (
                  <View
                    style={{
                      backgroundColor: "#FFFBEB",
                      borderWidth: 1,
                      borderColor: "#FCD34D",
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 12,
                      gap: 8,
                    }}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color="#D97706"
                      style={{ marginTop: 1 }}
                    />
                    <Text style={{ color: "#92400E", fontSize: 12, flex: 1 }}>
                      <Text style={{ fontWeight: "700" }}>
                        Replace Mode Active:{" "}
                      </Text>
                      All current photos will be removed and replaced with your
                      new uploads when you save.
                    </Text>
                  </View>
                )}

                {/* ── Upload new photos ── */}
                <TouchableOpacity
                  style={{
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: "#CBD5E0",
                    borderRadius: 12,
                    paddingVertical: 32,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#FAFAFA",
                  }}
                  onPress={pickNewPhotos}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={48}
                    color="#0D3778"
                  />
                  <Text
                    style={{
                      color: "#374151",
                      fontWeight: "500",
                      marginTop: 8,
                    }}
                  >
                    Tap to select new photos
                  </Text>
                  <Text
                    style={{ color: "#F87171", fontSize: 12, marginTop: 4 }}
                  >
                    JPEG, PNG (Max 10 MB each, max 10 photos)
                  </Text>
                </TouchableOpacity>

                {/* ── New photo previews ── */}
                {newPhotos.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons
                        name="images-outline"
                        size={18}
                        color="#0D3778"
                      />
                      <Text
                        style={{
                          color: "#0D3778",
                          fontWeight: "600",
                          fontSize: 13,
                          marginLeft: 6,
                        }}
                      >
                        New Photos Selected: {newPhotos.length}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                    >
                      {newPhotos.map((photo, index) => (
                        <View key={index} style={{ position: "relative" }}>
                          <Image
                            source={{ uri: photo.uri }}
                            style={{ width: 72, height: 72, borderRadius: 8 }}
                            contentFit="cover"
                          />
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              backgroundColor: "#EF4444",
                              borderRadius: 10,
                              width: 20,
                              height: 20,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onPress={() => removeNewPhoto(index)}
                          >
                            <Ionicons name="close" size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* ─── Buttons ─── */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderWidth: 2,
                    borderColor: "#0D3778",
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={20}
                    color="#0D3778"
                  />
                  <Text
                    style={{
                      color: "#0D3778",
                      fontWeight: "600",
                      marginLeft: 8,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    backgroundColor: loading ? "#6B87B8" : "#0D3778",
                    borderRadius: 12,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="white"
                      />
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "600",
                          marginLeft: 8,
                        }}
                      >
                        Update Vehicle
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ══════════════════════════════════════════════════════════════
                MAP MODAL — fully commented out
                To re-enable: uncomment this entire block + showMap state
                + map functions above + imports at top
                ══════════════════════════════════════════════════════════════

            <Modal visible={showMap} animationType="slide" presentationStyle="fullScreen">
                <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: "#0D3778",
                            borderBottomWidth: 1,
                            borderBottomColor: "#E5E7EB",
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Select Location</Text>
                        <TouchableOpacity onPress={() => setShowMap(false)}>
                            <Ionicons name="close" size={26} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#16A34A",
                                borderRadius: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={getCurrentLocation}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="navigate" size={18} color="white" />
                            <Text style={{ color: "white", fontWeight: "600", marginLeft: 8 }}>
                                Use My Current Location
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
                        <Text style={{ fontSize: 13, color: "#4B5563" }} numberOfLines={2}>
                            <Text style={{ fontWeight: "600" }}>Selected: </Text>
                            {selectedLocation.address || "Tap on map to select"}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                            Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            marginHorizontal: 16,
                            marginBottom: 12,
                            borderRadius: 12,
                            overflow: "hidden",
                            borderWidth: 2,
                            borderColor: "#0D3778",
                        }}
                    >
                        <MapView
                            ref={mapRef}
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: selectedLocation.lat,
                                longitude: selectedLocation.lng,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                            onPress={handleMapPress}
                        >
                            <Marker
                                coordinate={{ latitude: selectedLocation.lat, longitude: selectedLocation.lng }}
                                draggable
                                onDragEnd={handleMarkerDragEnd}
                            />
                        </MapView>
                    </View>

                    <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: "#EFF6FF", borderRadius: 8, flexDirection: "row", alignItems: "flex-start" }}>
                        <Ionicons name="information-circle-outline" size={18} color="#0D3778" style={{ marginTop: 1 }} />
                        <Text style={{ color: "#1E40AF", fontSize: 12, marginLeft: 8, flex: 1 }}>
                            Tap on the map to place a marker or drag it to adjust. Use the button above to set your current location.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={{
                            marginHorizontal: 16,
                            marginBottom: 16,
                            backgroundColor: "#0D3778",
                            borderRadius: 10,
                            paddingVertical: 14,
                            alignItems: "center",
                        }}
                        onPress={() => setShowMap(false)}
                        activeOpacity={0.8}
                    >
                        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Confirm Location</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>

            ══════════════════════════════════════════════════════════════ */}
      </SafeAreaView>
    </AppLayout>
  );
}
