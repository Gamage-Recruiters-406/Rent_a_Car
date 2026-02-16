import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
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

  const menuItems = [
    { id: 1, icon: 'home-outline', label: 'Home', route: '/home' },
    { id: 2, icon: 'car-outline', label: 'Browse Cars', route: '/vehicles/search' },
    { id: 3, icon: 'help-circle-outline', label: 'How it works', route: '/how-it-works' },
    { id: 4, icon: 'person-add-outline', label: 'Become a host', route: '/become-host' },
    { id: 5, icon: 'calendar-outline', label: 'My Bookings', route: '/bookings' },
    { id: 6, icon: 'notifications-outline', label: 'Notifications', route: '/notifications', badge: 3 },
    { id: 7, icon: 'person-outline', label: 'Profile', route: '/profile' },\n    { id: 8, icon: 'settings-outline', label: 'Settings', route: '/settings' },\n    { id: 9, icon: 'log-out-outline', label: 'Logout', route: '/logout' },
  ];

  const handleNavigation = (route) => {\n    onClose();
    router.push(route);
  };

  return (\n    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >\n      <View className="flex-1 flex-row">\n        {/* Main Sidebar */}
        <View className="flex-1 bg-[#1e3a8a]">\n          <ScrollView className="flex-1">\n            {/* Sidebar Header with User Info */}\n            <View className="bg-[#1e40af] pt-12 pb-8 px-6">\n              <View className="flex-row items-center mb-4">\n                <View className="w-12 h-12 rounded-full bg-blue-300 items-center justify-center mr-3">\n                  <Text className="text-xl font-bold text-white">\n                    {user?.name?.charAt(0)?.toUpperCase() || 'J'}\n                  </Text>\n                </View>\n                <View className="flex-1">\n                  <Text className="text-white text-lg font-bold">\n                    {user?.name || 'User Name'}\n                  </Text>\n                  <View className="flex-row items-center mt-1">\n                    <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />\n                    <Text className="text-blue-100 text-sm\">Online</Text>\n                  </View>\n                </View>\n              </View>\n            </View>\n\n            {/* Menu Items */}\n            <View className=\"pt-4\">\n              {menuItems.map((item) => (\n                <TouchableOpacity\n                  key={item.id}\n                  onPress={() => handleNavigation(item.route)}\n                  className=\"flex-row items-center px-6 py-4 border-b border-blue-700\"\n                  activeOpacity={0.7}\n                >\n                  <Ionicons\n                    name={item.icon}\n                    size={22}\n                    color=\"white\"\n                    style={{ marginRight: 16 }}\n                  />\n                  <Text className=\"text-white text-base flex-1\">\n                    {item.label}\n                  </Text>\n                  {item.badge && (\n                    <View className=\"bg-red-500 px-2 py-1 rounded-full\">\n                      <Text className=\"text-white text-xs font-bold\">\n                        {item.badge}\n                      </Text>\n                    </View>\n                  )}\n                </TouchableOpacity>\n              ))}\n            </View>\n          </ScrollView>\n        </View>\n\n        {/* Overlay - Close on tap */}\n        <TouchableOpacity\n          onPress={onClose}\n          className=\"flex-1 bg-black/40\"\n          activeOpacity={1}\n        />\n      </View>\n    </Modal>\n  );\n}
