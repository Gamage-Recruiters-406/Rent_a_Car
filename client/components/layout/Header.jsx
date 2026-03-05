import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
//import { ENV } from '../../config/env';

/**
 * Header Component
 * Displays role-based header for guest / customer / owner
 * 
 * user object from DB: { first_name, last_name, email, role (1|2), profilePicture, ... }
 * role: 1 = customer, 2 = owner
 */
export default function Header({
  title = 'Rent My Car',
  showMenu = true,
  showBack = false,
  showNotifications = true,
  onMenuPress = () => {},
  onBackPress = () => {},
  onNotificationsPress = () => {},
  onSettingsPress = () => {},
  user = null,
}) {
  // Determine role string from DB role number
  const userRole = user?.role === 2 ? 'owner' : user?.role === 1 ? 'customer' : 'guest';

  // Dynamic title
  const getTitle = () => {
    if (title !== 'Rent My Car') return title;
    if (userRole === 'owner') return 'Rent My Car';
    return 'Rent My Car';
  };

  // User initials for avatar fallback
  const getInitials = () => {
    if (!user) return '';
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">

        {/* Left - Logo + Title */}
        <View className="flex-row items-center">
          <Image
            source={require('../../assets/images/Rent My Car(Blue).png')}
            className="w-8 h-8 mr-2"
            resizeMode="contain"
          />
          <Text className="text-lg font-bold text-blue-900">{getTitle()}</Text>
        </View>

        {/* Right - Menu icon */}
        <View className="flex-row items-center">
          {showMenu && (
            <TouchableOpacity
              onPress={onMenuPress}
              className="p-2"
            >
              <Ionicons name="menu" size={28} color="#1e3a8a" />
            </TouchableOpacity>
          )}

          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              className="p-2"
            >
              <Ionicons name="arrow-back" size={28} color="#1e3a8a" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
