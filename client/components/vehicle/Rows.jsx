import React from "react";
import { View, Text } from "react-native";

export function SimpleRow({ label, value }) {
  return (
    <View className="flex-row justify-between py-1.5">
      <Text className="text-slate-600 text-[13px]">{label}</Text>

      <Text className="text-slate-900 text-[13px] font-bold">
        {value ?? "—"}
      </Text>
    </View>
  );
}

export function BulletRow({ label, value }) {
  return (
    <View className="flex-row items-start py-1.5">
      <View className="w-2 h-2 rounded-full mt-1.5 bg-[#0d3778]" />
      <View className="flex-1 ml-2.5">
        <Text className="text-slate-600 text-[12px]">{label}</Text>
        <Text className="text-slate-900 text-[13px] font-bold">
          {value ?? "—"}
        </Text>
      </View>
    </View>
  );
}

export function LegendItem({ bg, border, label }) {
  return (
    <View className="flex-row items-center">
      <View
        className="w-3.5 h-3.5 rounded bg-white border"
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 4,
        }}
      />
      <Text className="ml-1.5 text-[12px] text-slate-700">{label}</Text>
    </View>
  );
}
