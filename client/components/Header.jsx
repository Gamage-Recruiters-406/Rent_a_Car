import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ 
  title = 'Rent My Car', 
  showMenu = true, 
  showBack = false,
  showSearch = false,
  onMenuPress,
  onBackPress,
  onSearchPress,
  user
}) {
  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        {/* Left Side - Menu or Back Button */}
        <TouchableOpacity
          onPress={showBack ? onBackPress : onMenuPress}
          className="p-2"
        >
          <Ionicons
            name={showBack ? 'arrow-back' : 'menu'}
            size={28}
            color="#1e3a8a"
          />
        </TouchableOpacity>

        {/* Center - Title or Logo */}
        <View className="flex-1 items-center">
          {title === 'Rent My Car' ? (
            <View className="flex-row items-center">
              <Image
                source={require('../assets/images/icon.png')}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-xl font-bold text-blue-900">
                {title}
              </Text>
            </View>
          ) : (
            <Text className="text-xl font-bold text-blue-900">
              {title}
            </Text>
          )}
        </View>

        {/* Right Side - Search or Profile */}
        {showSearch ? (
          <TouchableOpacity
            onPress={onSearchPress}
            className="p-2"
          >
            <Ionicons name="search" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>
    </View>
  );
}
