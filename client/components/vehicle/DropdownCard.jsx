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
    <View className="border-2 border-[#0d3778] rounded-2xl bg-white p-3">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          {/* gap replacement */}
          <View className="mr-2.5">{icon}</View>

          <Text className="text-[14px] font-black text-[#0d3778]">{title}</Text>
        </View>

        {/* Arrow */}
        <Text className="text-[20px] font-bold text-[#0d3778]">
          {open ? "▾" : "▸"}
        </Text>
      </Pressable>

      {open && <View className="mt-2.5">{children}</View>}
    </View>
  );
}
