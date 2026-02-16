import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Dynamic Header Component
 * Changes based on user role: 'guest' | 'customer' | 'owner'
 * 
 * @param {Object} props - Component props
 * @param {string} props.userRole - Current user role ('guest', 'customer', 'owner')
 * @param {Object|null} props.user - User object containing user data
 * @param {string} props.title - Page title
 * @param {boolean} props.showMenu - Show menu icon
 * @param {boolean} props.showBack - Show back button
 * @param {boolean} props.showSearch - Show search icon
 * @param {boolean} props.showNotifications - Show notification bell
 * @param {Function} props.onMenuPress - Menu button callback
 * @param {Function} props.onBackPress - Back button callback
 * @param {Function} props.onSearchPress - Search button callback
 * @param {Function} props.onNotificationsPress - Notifications button callback
 */
export default function Header({
  userRole = 'guest',
  user = null,
  title = 'Rent My Car',
  showMenu = true,
  showBack = false,
  showSearch = false,
  showNotifications = true,
  onMenuPress = () => {},
  onBackPress = () => {},
  onSearchPress = () => {},
  onNotificationsPress = () => {},
}) {
  
  // Get notification count based on user role
  const getNotificationCount = () => {
    if (!user) return 0;
    // Customize badge counts based on role
    return userRole === 'owner' ? 5 : 3;
  };

  // Dynamic title based on user role and page
  const getDynamicTitle = () => {
    if (title !== 'Rent My Car') return title;
    if (userRole === 'owner') return 'Dashboard';
    if (userRole === 'customer') return 'Rent My Car';
    return 'Rent My Car';
  };

  const notificationCount = getNotificationCount();

  return (
    <View className="bg-white border-b border-gray-200 shadow-sm">
      {/* Main Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        {/* Left Side - Menu or Back Button */}
        <TouchableOpacity
          onPress={showBack ? onBackPress : onMenuPress}
          className="p-2"
          activeOpacity={0.6}
        >
          <Ionicons
            name={showBack ? 'arrow-back' : 'menu'}
            size={28}
            color="#1e3a8a"
          />
        </TouchableOpacity>

        {/* Center - Title or Logo */}
        <View className="flex-1 items-center">
          {userRole === 'guest' && title === 'Rent My Car' ? (
            <View className="flex-row items-center">
              <Image
                source={require('../../assets/images/icon.png')}
                className="w-8 h-8 mr-2"
                resizeMode="contain"
              />
              <Text className="text-xl font-bold text-blue-900">
                Rent My Car
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
              {userRole === 'customer' && (
                <Ionicons
                  name="car-outline"
                  size={24}
                  color="#1e3a8a"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-xl font-bold text-blue-900">
                {getDynamicTitle()}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side - Actions */}
        <View className="flex-row items-center">
          {showSearch && (
            <TouchableOpacity
              onPress={onSearchPress}
              className="p-2 mr-1"
              activeOpacity={0.6}
            >
              <Ionicons name="search-outline" size={24} color="#1e3a8a" />
            </TouchableOpacity>
          )}

          {user && showNotifications && (
            <TouchableOpacity
              onPress={onNotificationsPress}
              className="p-2 relative"
              activeOpacity={0.6}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#1e3a8a"
              />
              {notificationCount > 0 && (
                <View className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {!user && !showSearch && <View className="w-10" />}
        </View>
      </View>

      {/* User Role Badge - Shows after login */}
      {user && userRole !== 'guest' && (
        <View className="px-4 pb-3 flex-row items-center justify-between">
          <View className={`px-3 py-1 rounded-full flex-row items-center gap-2 ${
            userRole === 'owner' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            <Text className={`text-xs font-semibold ${
              userRole === 'owner' ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {userRole === 'owner' ? '🏢 Owner Mode' : '👤 Customer Mode'}
            </Text>
          </View>
          {user?.name && (
            <Text className="text-xs text-gray-600">
              {user.name}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
