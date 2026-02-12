import React from "react";
import { View, Text } from "react-native";

type RowProps = { label: string; value?: string | number | null };

export function SimpleRow({ label, value }: RowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: "#475569", fontSize: 13 }}>{label}</Text>
      <Text style={{ color: "#0f172a", fontSize: 13, fontWeight: "700" }}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

export function BulletRow({ label, value }: RowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        paddingVertical: 6,
        alignItems: "flex-start",
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          marginTop: 6,
          backgroundColor: "#0d3778",
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#475569", fontSize: 12 }}>{label}</Text>
        <Text style={{ color: "#0f172a", fontSize: 13, fontWeight: "700" }}>
          {value ?? "—"}
        </Text>
      </View>
    </View>
  );
}

type LegendProps = { bg: string; border: string; label: string };

export function LegendItem({ bg, border, label }: LegendProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        }}
      />
      <Text style={{ fontSize: 12, color: "#334155" }}>{label}</Text>
    </View>
  );
}
