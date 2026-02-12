import React from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  title: string;
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export default function DropdownCard({
  title,
  icon,
  open,
  onToggle,
  children,
}: Props) {
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

        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0d3778" }}>
          {open ? "−" : "+"}
        </Text>
      </Pressable>

      {open ? <View style={{ marginTop: 10 }}>{children}</View> : null}
    </View>
  );
}
