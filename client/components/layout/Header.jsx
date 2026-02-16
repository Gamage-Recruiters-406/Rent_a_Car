import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Header Component - Simple clean header matching design mockup
 * Shows logo/title on left, menu icon and settings on right
 */
export default function Header({
  onMenuPress = () => {},
  onSettingsPress = () => {},
}) {
  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
        {/* Left Side - Logo & Title */}
        <View className="flex-row items-center flex-1">
          <Image
            source={require('../../assets/images/icon.png')}
            className="w-8 h-8 mr-2"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-blue-900">Rent My Car</Text>
        </View>

        {/* Right Side - Menu & Settings Icons */}
        <TouchableOpacity
          onPress={onMenuPress}
          className="p-2"
          activeOpacity={0.6}
        >
          <Ionicons name="menu" size={24} color="#1e3a8a" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSettingsPress}
          className="p-2"
          activeOpacity={0.6}
        >
          <Ionicons name="settings-outline" size={24} color="#1e3a8a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
