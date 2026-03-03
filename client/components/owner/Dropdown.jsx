import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isSmallScreen } from "../../constants/screenSize";

/**
 * Dropdown
 * Props:
 *   label    {string}    — label shown above the dropdown
 *   options  {string[]}  — list of option strings
 *   selected {string}    — currently selected value
 *   onSelect {function}  — callback(value: string)
 *   zIndex   {number}    — controls stacking when multiple dropdowns exist
 */
export default function Dropdown({ label, options, selected, onSelect, zIndex = 10 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={{ marginBottom: 16, zIndex }}>
      {/* Label */}
      <Text
        className="text-[#0A2E5C] font-semibold text-center mb-2"
        style={{ fontSize: isSmallScreen ? 13 : 15 }}
      >
        {label}
      </Text>

      {/* Trigger */}
      <TouchableOpacity
        className="border border-gray-300 rounded-lg flex-row justify-between items-center bg-white"
        style={{
          paddingHorizontal: 14,
          paddingVertical: isSmallScreen ? 10 : 12,
        }}
        onPress={() => setIsOpen((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: isSmallScreen ? 13 : 15, color: "#374151" }}>
          {selected}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#374151"
        />
      </TouchableOpacity>

      {/* Options list */}
      {isOpen && (
        <View
          className="border border-gray-200 rounded-lg bg-white"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: zIndex + 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {options.map((opt, index) => (
            <TouchableOpacity
              key={opt}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: selected === opt ? "#EFF6FF" : "white",
                borderBottomWidth: index !== options.length - 1 ? 1 : 0,
                borderBottomColor: "#F3F4F6",
              }}
              onPress={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
            >
              <Text
                style={{
                  fontSize: isSmallScreen ? 13 : 15,
                  color: selected === opt ? "#0A2E5C" : "#374151",
                  fontWeight: selected === opt ? "600" : "400",
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}