import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';

const whiteLogo = require('../../assets/images/Rent My Car.png');
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

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
  const [activeItemId, setActiveItemId] = useState(1);
  const [bookingCounts, setBookingCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch booking counts and earnings when sidebar opens
  useEffect(() => {
    if (!isVisible || !user?._id) return;

    const fetchOwnerData = async () => {
      setLoadingData(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        // Fetch bookings and earnings in parallel
        const [bookingsRes, earningsRes] = await Promise.all([
          fetch(`${baseUrl}${apiVersion}/bookings/owner/${user._id}`, { headers }),
          fetch(`${baseUrl}${apiVersion}/bookings/owner/earnings/${user._id}`, { headers }),
        ]);

        const bookingsData = await bookingsRes.json();
        const earningsData = await earningsRes.json();

        // Count bookings by status
        if (bookingsData.success && Array.isArray(bookingsData.data)) {
          const counts = { approved: 0, pending: 0, rejected: 0 };
          bookingsData.data.forEach((b) => {
            if (counts[b.status] !== undefined) counts[b.status]++;
          });
          setBookingCounts(counts);
        }

        // Set earnings
        if (earningsData.success && earningsData.data) {
          setTotalEarnings(earningsData.data.totalEarnings || 0);
        }
      } catch (error) {
        console.error('Failed to fetch owner data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOwnerData();
  }, [isVisible, user?._id]);

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
      icon: 'add-circle-outline',
      label: 'Add Vehicle',
      route: '/vehicles/add',
      iconType: 'Ionicons',
    },
    {
      id: 4,
      icon: 'calendar-outline',
      label: 'Bookings',
      route: '/bookings',
      iconType: 'Ionicons',
      expandable: true,
      subItems: [
        { label: 'Approved', count: bookingCounts.approved },
        { label: 'Pending', count: bookingCounts.pending },
        { label: 'Rejected', count: bookingCounts.rejected },
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

  const renderIcon = (item, color = 'white') => {
    const iconProps = {
      size: 22,
      color: color,
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
        {/* Main Sidebar - 85% width */}
        <View className="bg-[#0D3778]" style={{ width: '70%' }}>

          <ScrollView className="flex-1">
            {/* Sidebar Header with Logo and Owner Info */}
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
                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Owner'}
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
                        setActiveItemId(item.id);
                        handleNavigation(item.route);
                      }
                    }}
                    className={`flex-row items-center px-6 py-4 mx-3 rounded-lg mb-1 ${
                      activeItemId === item.id ? 'bg-white' : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    {renderIcon(item, activeItemId === item.id ? '#0D3778' : 'white')}
                    <Text className={`text-base flex-1 ${
                      activeItemId === item.id ? 'font-bold' : ''
                    }`} style={{ color: activeItemId === item.id ? '#0D3778' : 'white' }}>{item.label}</Text>

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
                {loadingData ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-2xl font-bold">
                    Rs. {totalEarnings.toLocaleString()}
                  </Text>
                )}
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
