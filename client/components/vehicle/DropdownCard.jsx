import React from "react";
import { View, Text, Pressable } from "react-native";

export default function DropdownCard({
  title,
  icon,
  open,
  onToggle,
  children,
}) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: "#0d3778",
        borderRadius: 16,
        backgroundColor: "white",
        padding: 12,
      }}
    >
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {icon}
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#0d3778" }}>
            {title}
          </Text>
        </View>

        {/* Arrow */}
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0d3778" }}>
          {open ? "▾" : "▸"}
        </Text>
      </Pressable>

      {open && <View style={{ marginTop: 10 }}>{children}</View>}
    </View>
  );
}
