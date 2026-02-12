import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CustomerSidebar({ isVisible, onClose, user }) {
  const router = useRouter();

  const menuItems = [
    { id: 1, icon: 'home-outline', label: 'Home', route: '/home', badge: null },
    { id: 2, icon: 'car-outline', label: 'Browse Cars', route: '/vehicles/browse', badge: null },
    { id: 3, icon: 'help-circle-outline', label: 'How it works', route: '/how-it-works', badge: null },
    { id: 4, icon: 'person-add-outline', label: 'Become a host', route: '/become-host', badge: null },
    { id: 5, icon: 'calendar-outline', label: 'My Bookings', route: '/bookings', badge: null },
    { id: 6, icon: 'notifications-outline', label: 'Notifications', route: '/notifications', badge: 3 },
    { id: 7, icon: 'person-outline', label: 'Profile', route: '/profile', badge: null },
    { id: 8, icon: 'settings-outline', label: 'Settings', route: '/settings', badge: null },
    { id: 9, icon: 'log-out-outline', label: 'Logout', route: '/auth/logout', badge: null },
  ];

  const handleNavigation = (route) => {
    onClose();
    router.push(route);
  };

  if (!isVisible) return null;

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
            <View className="flex-row items-center mb-4">
              <Image
                source={require('../assets/images/icon.png')}
                className="w-12 h-12 rounded-full mr-3"
              />
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
                  <Text className="text-white font-bold text-lg">
                    {user?.first_name?.[0] || 'J'}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {user?.first_name || 'Jayan'} {user?.last_name || 'Gamage'}
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
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color="white" 
                />
                <Text className="text-white text-base ml-4 flex-1">
                  {item.label}
                </Text>
                {item.badge && (
                  <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
