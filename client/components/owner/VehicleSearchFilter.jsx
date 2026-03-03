import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Dropdown from "./Dropdown";
import { isSmallScreen } from "../../constants/screenSize";
import { TYPE_OPTIONS, TRANSMISSION_OPTIONS } from "../../constants/vehicleData";

/**
 * VehicleSearchFilter
 * Props:
 *   onSearch  {function}  — callback({ numberPlate, type, transmission })
 */
export default function VehicleSearchFilter({ onSearch }) {
  const [numberPlate, setNumberPlate] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All");

  const handleSearch = () => {
    onSearch({
      numberPlate,
      type: selectedType,
      transmission: selectedTransmission,
    });
  };

  return (
    <View
      className="border border-gray-200 rounded-xl"
      style={{ padding: isSmallScreen ? 14 : 18 }}
    >
      {/* Number Plate */}
      <Text
        className="text-[#0A2E5C] font-semibold text-center mb-2"
        style={{ fontSize: isSmallScreen ? 13 : 15 }}
      >
        Number Plate
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg"
        style={{
          paddingHorizontal: 14,
          paddingVertical: isSmallScreen ? 10 : 12,
          fontSize: isSmallScreen ? 13 : 15,
          marginBottom: 16,
          color: "#4B5563",
        }}
        placeholder="WP/AB 1234"
        placeholderTextColor="#9CA3AF"
        value={numberPlate}
        onChangeText={setNumberPlate}
      />

      {/* Type Dropdown — higher zIndex so it overlaps Transmission */}
      <Dropdown
        label="Type"
        options={TYPE_OPTIONS}
        selected={selectedType}
        onSelect={setSelectedType}
        zIndex={20}
      />

      {/* Transmission Dropdown */}
      <Dropdown
        label="Transmission"
        options={TRANSMISSION_OPTIONS}
        selected={selectedTransmission}
        onSelect={setSelectedTransmission}
        zIndex={10}
      />

      {/* Search Button */}
      <TouchableOpacity
        className="bg-[#0A2E5C] rounded-lg flex-row justify-center items-center"
        style={{
          paddingVertical: isSmallScreen ? 12 : 14,
          minHeight: Platform.OS === "ios" ? 44 : 48,
        }}
        onPress={handleSearch}
        activeOpacity={0.8}
      >
        <Ionicons
          name="search"
          size={isSmallScreen ? 16 : 18}
          color="white"
        />
        <Text
          className="text-white font-semibold ml-2"
          style={{ fontSize: isSmallScreen ? 14 : 16 }}
        >
          Search
        </Text>
      </TouchableOpacity>
    </View>
  );
}