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
    { id: 1, icon: 'home-outline', label: 'Home', route: '/Home/homepage' },
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

  // Sidebar animation state
  const [sidebarAnim] = useState(new Animated.Value(-300)); // Sidebar starts off-screen

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
            {/* Sidebar Header with Logo and User Info */}
            {/* ...existing code... */}
            {/* Menu Items */}
            {/* ...existing code... */}
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
