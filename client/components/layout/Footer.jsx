import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

/**
 * Dynamic Footer Component
 * Shows different navigation items based on user role
 * 
 * @param {Object} props - Component props
 * @param {string} props.userRole - Current user role ('guest', 'customer', 'owner')
 * @param {Object|null} props.user - User object
 */
export default function Footer({
  userRole = 'guest',
  user = null,
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Guest navigation items (Not logged in)
  const guestItems = [
    { id: 1, icon: 'home', iconOutline: 'home-outline', label: 'Home', route: '/', iconType: 'Ionicons' },
    { id: 2, icon: 'search', iconOutline: 'search-outline', label: 'Explore', route: '/explore', iconType: 'Ionicons' },
    { id: 3, icon: 'information-circle', iconOutline: 'information-circle-outline', label: 'About', route: '/about', iconType: 'Ionicons' },
    { id: 4, icon: 'log-in', iconOutline: 'log-in-outline', label: 'Login', route: '/login/SignInPage', iconType: 'Ionicons' },
  ];

  // Customer navigation items (Logged in as customer/user)
  const customerItems = [
    { id: 1, icon: 'home', iconOutline: 'home-outline', label: 'Home', route: '/home', iconType: 'Ionicons' },
    { id: 2, icon: 'search', iconOutline: 'search-outline', label: 'Search', route: '/vehicles/search', iconType: 'Ionicons' },
    { id: 3, icon: 'heart', iconOutline: 'heart-outline', label: 'Favorites', route: '/favorites', iconType: 'Ionicons' },
    { id: 4, icon: 'calendar', iconOutline: 'calendar-outline', label: 'Bookings', route: '/bookings', iconType: 'Ionicons' },
    { id: 5, icon: 'person', iconOutline: 'person-outline', label: 'Profile', route: '/profile', iconType: 'Ionicons' },
  ];

  // Owner navigation items (Logged in as vehicle owner)
  const ownerItems = [
    { id: 1, icon: 'view-dashboard', iconOutline: 'view-dashboard-outline', label: 'Dashboard', route: '/dashboard', iconType: 'MaterialCommunityIcons' },
    { id: 2, icon: 'car', iconOutline: 'car-outline', label: 'Vehicles', route: '/vehicles', iconType: 'Ionicons' },
    { id: 3, icon: 'calendar', iconOutline: 'calendar-outline', label: 'Bookings', route: '/bookings', iconType: 'Ionicons', badge: 5 },
    { id: 4, icon: 'cash', iconOutline: 'cash-outline', label: 'Earnings', route: '/earnings', iconType: 'Ionicons' },
    { id: 5, icon: 'person', iconOutline: 'person-outline', label: 'Profile', route: '/profile', iconType: 'Ionicons' },
  ];

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user || userRole === 'guest') return guestItems;
    if (userRole === 'owner') return ownerItems;
    return customerItems; // default to customer
  };

  const items = getNavigationItems();

  // Navigate to route
  const handleNavigation = (route) => {
    router.push(route);
  };

  // Check if route is active
  const isActive = (route) => {
    return pathname === route;
  };

  // Render appropriate icon based on type
  const renderIcon = (item, active) => {
    const iconName = active ? item.icon : item.iconOutline;
    const iconColor = active ? '#3b82f6' : '#9ca3af';

    if (item.iconType === 'MaterialCommunityIcons') {
      return (
        <MaterialCommunityIcons
          name={iconName}
          size={24}
          color={iconColor}
        />
      );
    }

    return (
      <Ionicons
        name={iconName}
        size={24}
        color={iconColor}
      />
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 shadow-lg">
      {/* Navigation Items */}
      <View className="flex-row justify-around items-center py-2 px-2">
        {items.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              className="items-center justify-center py-2 px-2 flex-1 relative"
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <View className="relative">
                {renderIcon(item, active)}
                {/* Badge for notification counts */}
                {item.badge && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                className={`text-[11px] mt-1 text-center ${
                  active ? 'text-blue-500 font-semibold' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Role indicator line - Visual indicator for logged-in users */}
      {user && userRole !== 'guest' && (
        <View className={`h-1 ${
          userRole === 'owner' ? 'bg-purple-500' : 'bg-blue-500'
        }`} />
      )}
    </View>
  );
}
