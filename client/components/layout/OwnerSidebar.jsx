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
      route: '/admin/settings',
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

  // Sidebar animation state
  const [sidebarAnim] = useState(new Animated.Value(-300)); // Sidebar starts off-screen

  useEffect(() => {
    if (isVisible) {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Animated Sidebar - slides from left */}
        <Animated.View
          className="bg-[#0D3778]"
          style={{
            width: '70%',
            transform: [{ translateX: sidebarAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <ScrollView className="flex-1">
            {/* Sidebar Header with Logo and Owner Info */}
            {/* ...existing code... */}
            {/* Menu Items */}
            {/* ...existing code... */}
            {/* Total Earnings Section */}
            {/* ...existing code... */}
            <View className="h-6" />
          </ScrollView>
        </Animated.View>

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
