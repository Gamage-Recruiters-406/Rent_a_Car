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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENV } from "../../config/env";

const API_BASE_URL = ENV.API_BASE_URL;

// Dropdown options
const VEHICLE_TYPES = [
  "Car",
  "Van",
  "SUV",
  "Pickup",
  "Bus",
  "Bike",
  "ThreeWheel",
  "Other",
];
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
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-4">
      <Text
        className="text-sm font-semibold mb-1.5"
        style={{ color: "#0D3778" }}
      >
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        className="border-2 rounded-lg px-3 py-3 flex-row justify-between items-center bg-white"
        style={{ borderColor: "#0D3778" }}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#0D3778" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-t-2xl max-h-[60%]">
            <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold" style={{ color: "#0D3778" }}>
                Select {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="px-2 py-2">
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className={`px-4 py-3.5 rounded-lg mx-2 mb-1 ${value === opt ? "bg-blue-50" : ""}`}
                  onPress={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                >
                  <Text
                    className={`text-base ${value === opt
                        ? "font-semibold text-blue-700"
                        : "text-gray-700"
                      }`}
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

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────
export default function AddVehicleScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

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

  const [photos, setPhotos] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState({
    lat: 6.9271,
    lng: 79.8612,
    address: "",
  });

  // ── Load draft on mount ──
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("vehicleDraft");
        if (saved) {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    })();
  }, []);

  // ── Helpers ──
  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Image Picker ──
  const pickImages = async () => {
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
      setPhotos(result.assets);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Location / Map functions ──
  const updateLocationFromCoordinates = async (lat, lng) => {
    // Update coordinates immediately so the marker moves right away
    setSelectedLocation((prev) => ({ ...prev, lat, lng }));

    try {
      // reverseGeocodeAsync requires location permission on some platforms
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        // Permission denied — just show coordinates as the address fallback
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedLocation({ lat, lng, address: fallback });
        updateField("address", fallback);
        return;
      }

      const [result] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (result) {
        const parts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        const address = parts.join(", ");
        setSelectedLocation({ lat, lng, address });
        updateField("address", address);
      } else {
        const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelectedLocation({ lat, lng, address: fallback });
        updateField("address", fallback);
      }
    } catch (e) {
      console.error("Reverse geocode error:", e);
      // Silently fall back to coordinate string — don't crash or block the user
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSelectedLocation({ lat, lng, address: fallback });
      updateField("address", fallback);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateLocationFromCoordinates(latitude, longitude);
  };

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateLocationFromCoordinates(latitude, longitude);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      await updateLocationFromCoordinates(latitude, longitude);
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (e) {
      Alert.alert("Error", "Could not get current location.");
      console.error("Location error:", e);
    }
  };

  // ── Draft ──
  const handleSaveDraft = async () => {
    try {
      await AsyncStorage.setItem("vehicleDraft", JSON.stringify(formData));
      Alert.alert("Success", "Draft saved successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to save draft.");
    }
  };

  // ── Validation & Submit ──
  const handleSubmit = () => {
    const requiredFields = [
      "title",
      "model",
      "vehicleType",
      "year",
      "fuelType",
      "numberPlate",
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
    if (photos.length === 0) {
      Alert.alert("Validation", "Please upload at least 1 photo.");
      return;
    }
    submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const body = new FormData();

      Object.entries(formData).forEach(([key, val]) => {
        body.append(key, val);
      });

      body.append("lat", selectedLocation.lat);
      body.append("lng", selectedLocation.lng);

      photos.forEach((photo, idx) => {
        const uri = photo.uri;
        const name = uri.split("/").pop() || `photo_${idx}.jpg`;
        const type = name.endsWith(".png") ? "image/png" : "image/jpeg";
        body.append("photos", { uri, name, type });
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/vehicle/create`, {
        method: "POST",
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create vehicle");
      }

      await AsyncStorage.removeItem("vehicleDraft");

      Alert.alert("Success", "Vehicle created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to create vehicle.");
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Card Container ─── */}
          <View
            className="bg-white rounded-xl p-5"
            style={{ borderWidth: 2, borderColor: "#0D3778" }}
          >
            {/* Header */}
            <View className="mb-5">
              <Text
                className="text-2xl font-bold mb-1"
                style={{ color: "#0D3778" }}
              >
                Add New Vehicle
              </Text>
              <Text className="text-gray-400 text-xs">
                Fill in details to list your car for rent and start earning
              </Text>
            </View>

            {/* ─── Vehicle Title ─── */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#0D3778" }}
              >
                Vehicle Title <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                style={{ borderColor: "#0D3778" }}
                placeholder="e.g., Toyota Camry 2020 - Automatic"
                placeholderTextColor="#9CA3AF"
                value={formData.title}
                onChangeText={(v) => updateField("title", v)}
                maxLength={100}
              />
              <Text className="text-right text-xs text-gray-400 mt-0.5">
                {formData.title.length}/100
              </Text>
            </View>

            {/* ─── Model & Type ─── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0D3778" }}
                >
                  Vehicle Model <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="e.g., Toyota"
                  placeholderTextColor="#9CA3AF"
                  value={formData.model}
                  onChangeText={(v) => updateField("model", v)}
                  maxLength={50}
                />
                <Text className="text-right text-xs text-gray-400 mt-0.5">
                  {formData.model.length}/50
                </Text>
              </View>
              <View className="flex-1">
                <DropdownPicker
                  label="Vehicle"
                  required
                  options={VEHICLE_TYPES}
                  value={formData.vehicleType}
                  onSelect={(v) => updateField("vehicleType", v)}
                />
              </View>
            </View>

            {/* ─── Year & Fuel ─── */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <DropdownPicker
                  label="Year"
                  required
                  options={YEARS}
                  value={formData.year}
                  onSelect={(v) => updateField("year", v)}
                />
              </View>
              <View className="flex-1">
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
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#0D3778" }}
              >
                Description
              </Text>
              <TextInput
                className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                style={{
                  borderColor: "#0D3778",
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
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0D3778" }}
                >
                  Number Plate <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="WP/AB 1234"
                  placeholderTextColor="#9CA3AF"
                  value={formData.numberPlate}
                  onChangeText={(v) => updateField("numberPlate", v)}
                />
              </View>
              <View style={{ width: 80 }}>
                <Text
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0D3778" }}
                >
                  KM <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="50000"
                  placeholderTextColor="#9CA3AF"
                  value={formData.km}
                  onChangeText={(v) => updateField("km", v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ width: 70 }}>
                <Text
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "#0D3778" }}
                >
                  Seats <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
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
                style={{ color: "#0D3778", fontWeight: "600", fontSize: 14, marginBottom: 8 }}
              >
                Rental Amount <Text style={{ color: "#EF4444" }}>*</Text>
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
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
                  <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
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

            {/* ─── Location ─── */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#0D3778" }}
              >
                Location <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 border-2 rounded-lg px-3 py-2.5 text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="Enter your location or pick on map"
                  placeholderTextColor="#9CA3AF"
                  value={formData.address}
                  onChangeText={(v) => updateField("address", v)}
                />
                <TouchableOpacity
                  className="rounded-lg px-3.5 justify-center items-center"
                  style={{ backgroundColor: "#0D3778" }}
                  onPress={() => setShowMap(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ─── Vehicle Photos ─── */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: "#0D3778" }}
              >
                Vehicle Photos
              </Text>
              <TouchableOpacity
                className="border-2 border-dashed rounded-xl py-8 items-center justify-center"
                style={{ borderColor: "#CBD5E0", backgroundColor: "#FAFAFA" }}
                onPress={pickImages}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={48}
                  color="#0D3778"
                />
                <Text className="text-gray-700 font-medium mt-2">
                  Tap to select photos
                </Text>
                <Text className="text-red-400 text-xs mt-1">
                  JPEG, PNG (Max 10 MB each, max 10 photos)
                </Text>
              </TouchableOpacity>

              {photos.length > 0 && (
                <View className="mt-3">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="images" size={18} color="#0D3778" />
                    <Text
                      className="text-sm font-semibold ml-1.5"
                      style={{ color: "#0D3778" }}
                    >
                      Photos Selected: {photos.length}
                    </Text>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {photos.map((photo, index) => (
                      <View key={index} className="relative">
                        <Image
                          source={{ uri: photo.uri }}
                          style={{ width: 72, height: 72, borderRadius: 8 }}
                          contentFit="cover"
                        />
                        <TouchableOpacity
                          className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full"
                          style={{
                            width: 20,
                            height: 20,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => removePhoto(index)}
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
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 py-3.5 border-2 rounded-xl flex-row justify-center items-center"
                style={{ borderColor: "#0D3778" }}
                onPress={handleSaveDraft}
                activeOpacity={0.7}
              >
                <Ionicons name="save-outline" size={20} color="#0D3778" />
                <Text
                  className="font-semibold ml-2"
                  style={{ color: "#0D3778" }}
                >
                  Save Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl flex-row justify-center items-center"
                style={{ backgroundColor: loading ? "#6B87B8" : "#0D3778" }}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="white"
                    />
                    <Text className="text-white font-semibold ml-2">
                      Publish
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Map Modal ─── */}
      <Modal visible={showMap} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView className="flex-1 bg-white">

          <View
            className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200"
            style={{ backgroundColor: "#0D3778" }}
          >
            <Text className="text-lg font-bold text-white">Select Location</Text>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={26} color="white" />
            </TouchableOpacity>
          </View>

          <View className="px-4 py-3">
            <TouchableOpacity
              className="bg-green-600 rounded-lg py-2.5 px-4 flex-row items-center justify-center"
              onPress={getCurrentLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Use My Current Location
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 pb-2">
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              <Text className="font-semibold">Selected: </Text>
              {selectedLocation.address || "Tap on map to select"}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
              {selectedLocation.lng.toFixed(6)}
            </Text>
          </View>

          <View
            className="flex-1 mx-4 mb-3 rounded-xl overflow-hidden border-2"
            style={{ borderColor: "#0D3778" }}
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
                coordinate={{
                  latitude: selectedLocation.lat,
                  longitude: selectedLocation.lng,
                }}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            </MapView>
          </View>

          <View className="mx-4 mb-2 px-3 py-2.5 bg-blue-50 rounded-lg flex-row items-start">
            <Ionicons
              name="bulb-outline"
              size={18}
              color="#0D3778"
              style={{ marginTop: 1 }}
            />
            <Text className="text-xs text-gray-600 ml-2 flex-1">
              Tap on the map to place a marker, drag the marker to adjust, or
              use the button above to set your current location.
            </Text>
          </View>

          <View className="px-4 py-3">
            <TouchableOpacity
              className="rounded-xl py-3.5 items-center"
              style={{ backgroundColor: "#0D3778" }}
              onPress={() => setShowMap(false)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                Confirm Location
              </Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}