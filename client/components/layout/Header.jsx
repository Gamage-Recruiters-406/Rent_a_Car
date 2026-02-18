import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ENV } from '../../config/env';

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
    if (userRole === 'owner') return 'Owner Dashboard';
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
          {user && showNotifications && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              className="p-2 mr-1"
            >
              <Ionicons name="notifications-outline" size={24} color="#1e3a8a" />
            </TouchableOpacity>
          )}

          {user && (
            <TouchableOpacity onPress={onSettingsPress} className="p-1 mr-1">
              {user.profilePicture ? (
                <Image
                  source={{ uri: `${ENV.API_BASE_URL}/${user.profilePicture}` }}
                  className="w-9 h-9 rounded-full border-2 border-blue-200"
                />
              ) : (
                <View className="w-9 h-9 rounded-full bg-blue-900 items-center justify-center">
                  <Text className="text-white text-sm font-bold">{getInitials()}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

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

      {/* User Info Bar - only for logged in users */}
      {user && userRole !== 'guest' && (
        <View className="px-4 pb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className={`px-3 py-1 rounded-full ${
              userRole === 'owner' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-semibold ${
                userRole === 'owner' ? 'text-purple-700' : 'text-blue-700'
              }`}>
                {userRole === 'owner' ? '🏢 Owner' : '👤 Customer'}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xs font-medium text-gray-700">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-[10px] text-gray-400">{user.email}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
