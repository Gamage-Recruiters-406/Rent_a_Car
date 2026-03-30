import React, { useState } from 'react';
import { Animated } from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';

const whiteLogo = require('../../assets/images/Rent My Car.png');
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // ✅ FIX: Logout now properly clears token and redirects — previously routed to '/logout' which doesn't exist
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      onClose();
      router.replace('/login'); // adjust to your actual login route
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 1, icon: 'home-outline', label: 'Home', route: '/Home/homepage' },
    { id: 2, icon: 'car-outline', label: 'Browse Cars', route: '/CustomerVehicleList' },
    { id: 3, icon: 'calendar-outline', label: 'My Bookings', route: '/Cus_booking-history/booking-history' },
    { id: 4, icon: 'star-outline', label: 'My Reviews', route: '/MyReviews' },
    { id: 5, icon: 'call-outline', label: 'Contact Us', route: '/contact' },
    { id: 6, icon: 'notifications-outline', label: 'Notifications', route: '/Notifications/Notification' },
    { id: 7, icon: 'person-outline', label: 'Profile', route: '/profilepages/CustomerProfileEdit' },
    { id: 8, icon: 'settings-outline', label: 'Settings', route: '/admin/settings' },
    // ✅ FIX: Logout item no longer uses a route — uses onPress with handleLogout directly
    { id: 9, icon: 'log-out-outline', label: 'Logout', isLogout: true },
  ];

  const handleNavigation = (item) => {
    if (item.isLogout) {
      handleLogout();
      return;
    }
    setActiveItemId(item.id);
    onClose();
    router.push(item.route);
  };

  // Sidebar animation state
  const [sidebarAnim] = useState(new Animated.Value(-300));

  React.useEffect(() => {
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
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Animated Sidebar - slides from left */}
        <Animated.View
          style={{
            width: '70%',
            backgroundColor: '#0D3778',
            transform: [{ translateX: sidebarAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            {/* Sidebar Header with Logo and User Info */}
            <View style={{ paddingTop: 32, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#0D3778' }}>
              {/* Logo and App Name Row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
                <Image
                  source={whiteLogo}
                  style={{ width: 36, height: 36, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Rent My Car</Text>
              </View>
              {/* User Avatar, Name, Online */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden' }}>
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.EXPO_PUBLIC_API_BASE_URL}/${user.profilePicture}` }}
                      style={{ width: 38, height: 38, borderRadius: 19 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                      {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                    {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 5 }} />
                    <Text style={{ color: '#bae6fd', fontSize: 13 }}>Online</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={{ marginTop: 15 }}>
              {menuItems.map((item) => {
                const isActive = activeItemId === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16, // more vertical space
                      paddingHorizontal: 24,
                      backgroundColor: isActive ? '#fff' : 'transparent',
                      borderRadius: 8,
                      marginVertical: 2,
                    }}
                    onPress={() => handleNavigation(item)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? '#0D3778' : '#cbd5e1'}
                      style={{ marginRight: 16 }}
                    />
                    <Text style={{
                      color: isActive ? '#0D3778' : '#cbd5e1',
                      fontSize: 17, // increased size
                      flex: 1,
                      fontWeight: isActive ? '600' : '400',
                      letterSpacing: 0.1,
                    }}>
                      {item.label}
                    </Text>
                    {item.badge && (
                      <View style={{
                        backgroundColor: 'red',
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        marginLeft: 8,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Overlay - Close on tap */}
        <TouchableOpacity
          onPress={onClose}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}