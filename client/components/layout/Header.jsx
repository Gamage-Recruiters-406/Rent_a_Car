import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Header Component - Enhanced header with role-based features
 * Shows logo/title on left, dynamic actions on right based on user role
 */
export default function Header({
  title = 'Rent My Car',
  showMenu = true,
  showBack = false,
  showSearch = false,
  showNotifications = true,
  onMenuPress = () => {},
  onBackPress = () => {},
  onSearchPress = () => {},
  onNotificationsPress = () => {},
  onSettingsPress = () => {},
  user,
  userRole = 'guest', // 'guest', 'customer', 'owner'
}) {
  
  // Get notification badge count based on role
  const getNotificationCount = () => {
    if (!user) return 0;
    return userRole === 'owner' ? 5 : 3; // Example: owners have 5, customers have 3
  };

  // Dynamic title based on role
  const getDynamicTitle = () => {
    if (title !== 'Rent My Car') return title;
    if (userRole === 'owner') return 'Owner Dashboard';
    if (userRole === 'customer') return 'Rent My Car';
    return 'Rent My Car';
  };

  const notificationCount = getNotificationCount();

  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
        {/* Left Side - Menu or Back Button */}
        {showMenu || showBack ? (
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
        ) : (
          <View className="w-10" />
        )}

        {/* Center - Title or Logo */}
        <View className="flex-1 items-center">
          {title === 'Rent My Car' && userRole === 'guest' ? (
            <View className="flex-row items-center">
              <Image
                source={require('../../assets/images/icon.png')}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-lg font-bold text-blue-900">
                {getDynamicTitle()}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              {userRole === 'owner' && (
                <MaterialCommunityIcons 
                  name="view-dashboard-outline" 
                  size={24} 
                  color="#1e3a8a" 
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-lg font-bold text-blue-900">
                {getDynamicTitle()}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side - Actions based on user role */}
        <View className="flex-row items-center">
          {showSearch && (
            <TouchableOpacity
              onPress={onSearchPress}
              className="p-2 mr-1"
            >
              <Ionicons name="search-outline" size={24} color="#1e3a8a" />
            </TouchableOpacity>
          )}
          
          {user && showNotifications && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              className="p-2 relative mr-1"
            >
              <Ionicons name="notifications-outline" size={24} color="#1e3a8a" />
              {notificationCount > 0 && (
                <View className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={onSettingsPress}
            className="p-2"
            activeOpacity={0.6}
          >
            <Ionicons name="settings-outline" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Role Indicator Badge (Optional) */}
      {user && userRole !== 'guest' && (
        <View className="px-4 pb-2">
          <View className="flex-row items-center">
            <View className={`px-3 py-1 rounded-full ${
              userRole === 'owner' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-semibold ${
                userRole === 'owner' ? 'text-purple-700' : 'text-blue-700'
              }`}>
                {userRole === 'owner' ? '🏢 Owner Mode' : '👤 Customer Mode'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
