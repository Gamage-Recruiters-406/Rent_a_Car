import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';

const whiteLogo = require('../../assets/images/Rent My Car.png');
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * CustomerSidebar Component - Sidebar menu for customer/user
 * Shows user profile and navigation items
 */
export default function CustomerSidebar({
  isVisible,
  onClose,
  user = {},
}) {
  const router = useRouter();
  const [activeItemId, setActiveItemId] = useState(1);

  const menuItems = [
    { id: 1, icon: 'home-outline', label: 'Home', route: '/home' },
    { id: 2, icon: 'car-outline', label: 'Browse Cars', route: '/vehicles/search' },
    { id: 3, icon: 'help-circle-outline', label: 'How it works', route: '/how-it-works' },
    { id: 4, icon: 'person-add-outline', label: 'Become a host', route: '/become-host' },
    { id: 5, icon: 'calendar-outline', label: 'My Bookings', route: '/bookings' },
    { id: 6, icon: 'notifications-outline', label: 'Notifications', route: '/notifications', badge: 3 },
    { id: 7, icon: 'person-outline', label: 'Profile', route: '/profile' },
    { id: 8, icon: 'settings-outline', label: 'Settings', route: '/settings' },
    { id: 9, icon: 'log-out-outline', label: 'Logout', route: '/logout' },
  ];

  const handleNavigation = (item) => {
    setActiveItemId(item.id);
    onClose();
    router.push(item.route);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Main Sidebar - 85% width */}
        <View className="bg-[#0D3778]" style={{ width: '70%' }}>

          <ScrollView className="flex-1">
            {/* Sidebar Header with Logo and User Info */}
            <View className="bg-[#0D3778] pt-12 pb-8 px-6">
              <View className="flex-row items-center mb-6">
                <Image
                  source={whiteLogo}
                  className="w-10 h-10 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-xl font-bold text-white">Rent My Car</Text>
              </View>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-300 items-center justify-center mr-3">
                  <Text className="text-xl font-bold text-white">
                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User Name'}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    <Text className="text-blue-100 text-sm">Online</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View className="pt-4">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleNavigation(item)}
                  className={`flex-row items-center px-6 py-4 mx-3 rounded-lg mb-1 ${
                    activeItemId === item.id ? 'bg-white' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={activeItemId === item.id ? '#0D3778' : 'white'}
                    style={{ marginRight: 16 }}
                  />
                  <Text className={`text-base flex-1 ${
                    activeItemId === item.id ? 'font-bold' : ''
                  }`} style={{ color: activeItemId === item.id ? '#0D3778' : 'white' }}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View className="bg-red-500 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Overlay - Close on tap */}
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 bg-black/40"
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}
