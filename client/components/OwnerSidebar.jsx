import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OwnerSidebar({ isVisible, onClose, user }) {
  const router = useRouter();

  const menuItems = [
    { id: 1, icon: 'view-dashboard-outline', label: 'Dashboard', route: '/dashboard', iconType: 'MaterialCommunityIcons' },
    { id: 2, icon: 'car-outline', label: 'My Vehicles', route: '/vehicles', iconType: 'Ionicons' },
    { id: 3, icon: 'car-plus', label: 'Add Vehicle', route: '/vehicles/add', iconType: 'MaterialCommunityIcons' },
    { id: 4, icon: 'calendar-outline', label: 'Bookings', route: '/bookings', iconType: 'Ionicons', badge: 5 },
    { id: 5, icon: 'cash-outline', label: 'Earnings', route: '/earnings', iconType: 'Ionicons' },
    { id: 6, icon: 'star-outline', label: 'Reviews', route: '/reviews', iconType: 'Ionicons' },
    { id: 7, icon: 'notifications-outline', label: 'Notifications', route: '/notifications', iconType: 'Ionicons', badge: 3 },
    { id: 8, icon: 'person-outline', label: 'Profile', route: '/profile', iconType: 'Ionicons' },
    { id: 9, icon: 'settings-outline', label: 'Settings', route: '/settings', iconType: 'Ionicons' },
  ];

  const handleNavigation = (route) => {
    onClose();
    router.push(route);
  };

  if (!isVisible) return null;

  const renderIcon = (item) => {
    if (item.iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} size={24} color="white" />;
    }
    return <Ionicons name={item.icon} size={24} color="white" />;
  };

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 z-50">
      {/* Backdrop */}
      <TouchableOpacity 
        className="absolute inset-0 bg-black/50"
        onPress={onClose}
        activeOpacity={1}
      />
      
      {/* Sidebar */}
      <View className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#1e3a8a]">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="bg-[#1e40af] pt-12 pb-6 px-5">
            <View className="items-center mb-4">
              <Text className="text-white text-xl font-bold">Rent My Car</Text>
            </View>
            
            {/* User Info */}
            <View className="flex-row items-center mt-2">
              <View className="w-12 h-12 rounded-full bg-blue-300 items-center justify-center mr-3">
                {user?.profilePicture ? (
                  <Image 
                    source={{ uri: user.profilePicture }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <Text className="text-white font-bold text-lg">U</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {user?.first_name || 'User'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  <Text className="text-white/80 text-sm">Online</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="py-4">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center px-5 py-4 ${
                  item.id === 1 ? 'bg-white/10' : ''
                }`}
                onPress={() => handleNavigation(item.route)}
              >
                {renderIcon(item)}
                <Text className="text-white text-base ml-4 flex-1">
                  {item.label}
                </Text>
                {item.badge && (
                  <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{item.badge}</Text>
                  </View>
                )}
                {item.id === 4 && (
                  <Ionicons name="chevron-up" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}

            {/* Bookings Submenu (Collapsed Example) */}
            {/* Uncomment to show expanded bookings submenu
            <View className="bg-white/5 py-2">
              <TouchableOpacity className="flex-row items-center px-12 py-3">
                <Text className="text-white/90 text-sm">Approved</Text>
                <Text className="text-white/60 text-xs ml-auto">(5)</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center px-12 py-3">
                <Text className="text-white/90 text-sm">Pending</Text>
                <Text className="text-white/60 text-xs ml-auto">(2)</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center px-12 py-3">
                <Text className="text-white/90 text-sm">Rejected</Text>
                <Text className="text-white/60 text-xs ml-auto">(1)</Text>
              </TouchableOpacity>
            </View>
            */}
          </View>

          {/* Total Earnings Card */}
          <View className="mx-5 mb-6 bg-[#1e40af] rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="cash" size={20} color="#fbbf24" />
              <Text className="text-white/80 text-sm ml-2">Total Earnings</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              Rs. {user?.totalEarnings?.toLocaleString() || '45,000'}
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="flex-row items-center px-5 py-4 mb-6"
            onPress={() => handleNavigation('/auth/logout')}
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text className="text-white text-base ml-4">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
