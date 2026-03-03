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

  // Resolve owner ID — handles _id, id, or userid fields from JWT/user object
  const ownerId = user?._id || user?.id || user?.userid;

  // Fetch booking counts and earnings when sidebar opens
  useEffect(() => {
    if (!isVisible || !ownerId) return;

    const fetchOwnerData = async () => {
      setLoadingData(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        // Fetch all owner bookings + earnings in parallel
        const [bookingsRes, earningsRes] = await Promise.all([
          fetch(`${baseUrl}${apiVersion}/bookings/owner`, { headers }),
          fetch(`${baseUrl}${apiVersion}/bookings/owner/earnings/${ownerId}`, { headers }),
        ]);

        if (!bookingsRes.ok) console.error('Bookings fetch failed:', bookingsRes.status);
        if (!earningsRes.ok) console.error('Earnings fetch failed:', earningsRes.status);

        const bookingsData = await bookingsRes.json();
        const earningsData = await earningsRes.json();

        // Count bookings by status + calculate earnings from fetched data directly
        if (bookingsData.success && Array.isArray(bookingsData.data)) {
          const counts = { approved: 0, pending: 0, rejected: 0 };
          let earnings = 0;

          bookingsData.data.forEach((b) => {
            const status = b.status?.toLowerCase().trim();

            // Count by status
            if (counts[status] !== undefined) counts[status]++;

            // Earnings from approved + paid bookings with totalAmount > 0
            if ((status === 'approved' || status === 'paid') && b.totalAmount > 0) {
              earnings += b.totalAmount;
            }
          });

          setBookingCounts(counts);
          setTotalEarnings(earnings);
        } else {
          console.warn('Unexpected bookings response:', bookingsData);
        }
      } catch (error) {
        console.error('Failed to fetch owner data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchOwnerData();
  }, [isVisible, ownerId]);

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
      icon: 'home-outline',
      label: 'Home',
      route: '/Home/homepage',
      iconType: 'Ionicons',
    },
    {
      id: 2,
      icon: 'view-dashboard-outline',
      label: 'Dashboard',
      route: '/owner/owner-dashboard',
      iconType: 'MaterialCommunityIcons',
    },
    {
      id: 3,
      icon: 'car-outline',
      label: 'My Vehicles',
      route: '/owner/my-vehicle',
      iconType: 'Ionicons',
    },
    {
      id: 4,
      icon: 'add-circle-outline',
      label: 'Add Vehicle',
      route: '/owner/AddVehicle',
      iconType: 'Ionicons',
    },
    {
      id: 5,
      icon: 'calendar-outline',
      label: 'Bookings',
      route: '/booking',
      iconType: 'Ionicons',
      expandable: true,
      subItems: [
        { label: 'Approved', count: bookingCounts.approved },
        { label: 'Pending',  count: bookingCounts.pending  },
        { label: 'Rejected', count: bookingCounts.rejected },
      ],
    },
    {
      id: 6,
      icon: 'cash-outline',
      label: 'Earnings',
      route: '/owner/rental-history',
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
      route: '/profilepages/OwnerProfileEdit',
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Image
                  source={whiteLogo}
                  style={{ width: 40, height: 40, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Rent My Car</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <View style={{ alignItems: 'center', marginRight: 12 }}>
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture.startsWith('http') ? user.profilePicture : `${baseUrl}/${user.profilePicture}` }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#3b82f6',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
                        {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 4 }} />
                    <Text style={{ color: '#b6cdfd', fontSize: 12 }}>Online</Text>
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
                    onLongPress={() => {
                      if (item.expandable) {
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