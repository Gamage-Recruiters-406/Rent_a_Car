import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Animated,
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
export default function OwnerSidebar({ isVisible, onClose, user = {} }) {
  const router = useRouter();
  const [expandedBookings, setExpandedBookings] = useState(false);
  const [activeItemId, setActiveItemId] = useState(1);
  const [bookingCounts, setBookingCounts] = useState({ approved: 0, pending: 0, rejected: 0 });
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [sidebarAnim] = useState(new Animated.Value(-300));

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

        // ✅ FIXED: Correct routes matching backend
        // Backend: GET /bookings/owner           → getOwnerBookings (uses req.user.userid internally)
        // Backend: GET /bookings/owner/earnings/:ownerId → getOwnerEarnings
        const [bookingsRes, earningsRes] = await Promise.all([
          fetch(`${baseUrl}${apiVersion}/bookings/owner`, { headers }),
          fetch(`${baseUrl}${apiVersion}/bookings/owner/earnings/${user._id}`, { headers }),
        ]);

        if (!bookingsRes.ok) {
          console.error('Bookings fetch failed:', bookingsRes.status);
        }
        if (!earningsRes.ok) {
          console.error('Earnings fetch failed:', earningsRes.status);
        }

        const bookingsData = await bookingsRes.json();
        const earningsData = await earningsRes.json();

        // Count bookings by status
        if (bookingsData.success && Array.isArray(bookingsData.data)) {
          const counts = { approved: 0, pending: 0, rejected: 0 };
          bookingsData.data.forEach((b) => {
            if (counts[b.status] !== undefined) counts[b.status]++;
          });
          setBookingCounts(counts);
        } else {
          console.warn('Bookings response:', bookingsData);
        }

        // Set total earnings
        if (earningsData.success && earningsData.data) {
          setTotalEarnings(earningsData.data.totalEarnings || 0);
        } else {
          console.warn('Earnings response:', earningsData);
        }
      } catch (error) {
        console.error('Failed to fetch owner data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOwnerData();
  }, [isVisible, user?._id]);

  // Sidebar slide animation
  useEffect(() => {
    Animated.timing(sidebarAnim, {
      toValue: isVisible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const handleNavigation = (route) => {
    onClose();
    router.push(route);
  };

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
        { label: 'Pending',  count: bookingCounts.pending  },
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
      isLogout: true,
    },
  ];

  function renderIcon(item, color) {
    const iconProps = { size: 22, color, style: { marginRight: 16 } };
    if (item.iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} {...iconProps} />;
    }
    return <Ionicons name={item.icon} {...iconProps} />;
  }

  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        {/* Animated Sidebar */}
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
            {/* Header */}
            <View className="bg-[#0D3778] pt-12 pb-8 px-6">
              <View className="flex-row items-center mb-6">
                <Image source={whiteLogo} className="w-10 h-10 mr-3" resizeMode="contain" />
                <Text className="text-xl font-bold text-white">Rent My Car</Text>
              </View>
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full bg-blue-300 items-center justify-center mr-4">
                  <Text className="text-xl font-bold text-white">
                    {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : 'User'}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                    <Text className="text-blue-100 text-sm">Online</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            {menuItems.map((item) => {
              const isActive = activeItemId === item.id;
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.expandable) {
                        setExpandedBookings(!expandedBookings);
                      } else if (item.isLogout) {
                        AsyncStorage.removeItem('userToken');
                        onClose();
                        router.replace('/login');
                      } else {
                        setActiveItemId(item.id);
                        handleNavigation(item.route);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 24,
                      backgroundColor: isActive ? '#fff' : 'transparent',
                      borderRadius: 8,
                      marginVertical: 2,
                    }}
                    activeOpacity={0.7}
                  >
                    {renderIcon(item, isActive ? '#0D3778' : 'white')}
                    <Text
                      style={{
                        color: isActive ? '#0D3778' : 'white',
                        fontSize: 16,
                        flex: 1,
                        fontWeight: isActive ? 'bold' : 'normal',
                      }}
                    >
                      {item.label}
                    </Text>

                    {item.expandable && (
                      <MaterialCommunityIcons
                        name={expandedBookings ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isActive ? '#0D3778' : 'white'}
                      />
                    )}

                    {item.badge && (
                      <View
                        style={{
                          backgroundColor: 'red',
                          borderRadius: 8,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginLeft: 8,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12 }}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Expandable Booking Sub-items */}
                  {item.expandable && expandedBookings && item.subItems && (
                    <View style={{ backgroundColor: '#1a2f70' }}>
                      {item.subItems.map((subItem, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 36,
                            borderBottomWidth: 1,
                            borderBottomColor: '#2563eb',
                          }}
                        >
                          <Text style={{ color: '#cbd5e1', fontSize: 15, flex: 1 }}>
                            {subItem.label}
                          </Text>
                          {loadingData ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                              ({subItem.count})
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Total Earnings Section */}
            <View style={{ paddingHorizontal: 16, marginTop: 24, marginBottom: 12 }}>
              <View
                style={{
                  backgroundColor: '#1e3a8a',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <Text
                  style={{
                    color: '#cbd5e1',
                    fontSize: 14,
                    marginBottom: 6,
                    fontWeight: '600',
                    alignSelf: 'flex-start',
                  }}
                >
                  <Ionicons name="cash-outline" size={16} color="#cbd5e1" /> Total Earnings
                </Text>
                {loadingData ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#22c55e', fontSize: 22, fontWeight: 'bold' }}>
                    Rs. {totalEarnings.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>

            <View className="h-6" />
          </ScrollView>
        </Animated.View>

        {/* Overlay */}
        <TouchableOpacity onPress={onClose} className="flex-1 bg-black/40" activeOpacity={1} />
      </View>
    </Modal>
  );
}