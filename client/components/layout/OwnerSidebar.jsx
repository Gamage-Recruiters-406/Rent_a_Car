import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * OwnerSidebar Component - Sidebar menu for vehicle owner
 * Shows owner profile and navigation items with expandable sections
 */
export default function OwnerSidebar({
  isVisible,
  onClose,
  user = {},
}) {
  const router = useRouter();
  const [expandedBookings, setExpandedBookings] = useState(false);

  const menuItems = [
    {
      id: 1,
      icon: 'view-dashboard-outline',
      label: 'Dashboard',
      route: '/dashboard',
      iconType: 'MaterialCommunityIcons',
    },
    {
      id: 2,
      icon: 'car-outline',
      label: 'My Vehicles',
      route: '/vehicles',
      iconType: 'Ionicons',
    },
    {
      id: 3,
      icon: 'car-plus',
      label: 'Add Vehicle',
      route: '/vehicles/add',
      iconType: 'MaterialCommunityIcons',
    },
    {
      id: 4,
      icon: 'calendar-outline',
      label: 'Bookings',
      route: '/bookings',
      iconType: 'Ionicons',
      expandable: true,
      subItems: [
        { label: 'Approved', count: '5' },
        { label: 'Pending', count: '2' },
        { label: 'Rejected', count: '1' },
      ],
    },
    {
      id: 5,
      icon: 'cash-outline',
      label: 'Earnings',
      route: '/earnings',
      iconType: 'Ionicons',
    },
    {
      id: 6,
      icon: 'star-outline',
      label: 'Reviews',
      route: '/reviews',
      iconType: 'Ionicons',
    },
    {
      id: 7,
      icon: 'notifications-outline',
      label: 'Notifications',
      route: '/notifications',
      iconType: 'Ionicons',
      badge: 3,
    },
    {
      id: 8,
      icon: 'person-outline',
      label: 'Profile',
      route: '/profile',
      iconType: 'Ionicons',
    },
    {
      id: 9,
      icon: 'settings-outline',
      label: 'Settings',
      route: '/settings',
      iconType: 'Ionicons',
    },
    {
      id: 10,
      icon: 'log-out-outline',
      label: 'Logout',
      route: '/logout',
      iconType: 'Ionicons',
    },
  ];

  const handleNavigation = (route) => {
    onClose();
    router.push(route);
  };

  const renderIcon = (item) => {
    const iconProps = {
      size: 22,
      color: 'white',
      style: { marginRight: 16 },
    };

    if (item.iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} {...iconProps} />;
    }
    return <Ionicons name={item.icon} {...iconProps} />;
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Main Sidebar */}
        <View className="flex-1 bg-[#1e3a8a]">
          <ScrollView className="flex-1">
            {/* Sidebar Header with Owner Info */}
            <View className="bg-[#1e40af] pt-12 pb-8 px-6">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-300 items-center justify-center mr-3">
                  <Text className="text-xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user?.name || 'Owner'}
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
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.expandable) {
                        setExpandedBookings(!expandedBookings);
                      } else {
                        handleNavigation(item.route);
                      }
                    }}
                    className="flex-row items-center px-6 py-4 border-b border-blue-700"
                    activeOpacity={0.7}
                  >
                    {renderIcon(item)}
                    <Text className="text-white text-base flex-1">{item.label}</Text>

                    {item.expandable && (
                      <MaterialCommunityIcons
                        name={expandedBookings ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="white"
                      />
                    )}

                    {item.badge && (
                      <View className="bg-red-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Sub Items for Bookings */}
                  {item.expandable && expandedBookings && item.subItems && (
                    <View className="bg-[#1a2f70]">
                      {item.subItems.map((subItem, index) => (
                        <TouchableOpacity
                          key={index}
                          className="flex-row items-center px-12 py-3 border-b border-blue-600"
                          onPress={() => handleNavigation(item.route)}
                          activeOpacity={0.7}
                        >
                          <Text className="text-blue-200 text-sm flex-1">
                            {subItem.label}
                          </Text>
                          <Text className="text-blue-300 text-xs font-semibold">
                            {subItem.count}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Total Earnings Section */}
              <View className="mx-6 mt-6 p-4 bg-[#1a2f70] rounded-lg border border-blue-600">
                <Text className="text-blue-200 text-sm mb-2">Total Earnings</Text>
                <Text className="text-white text-2xl font-bold">Rs. 45,000</Text>
              </View>
            </View>

            <View className="h-6" />
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
