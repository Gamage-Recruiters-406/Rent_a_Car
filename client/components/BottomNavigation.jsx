import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNavigation({ userRole = 'customer' }) {
  const router = useRouter();
  const pathname = usePathname();

  // Customer navigation items
  const customerItems = [
    { id: 1, icon: 'home', iconOutline: 'home-outline', label: 'Home', route: '/home' },
    { id: 2, icon: 'search', iconOutline: 'search-outline', label: 'Search', route: '/vehicles/search' },
    { id: 3, icon: 'heart', iconOutline: 'heart-outline', label: 'Favorites', route: '/favorites' },
    { id: 4, icon: 'calendar', iconOutline: 'calendar-outline', label: 'Bookings', route: '/bookings' },
    { id: 5, icon: 'person', iconOutline: 'person-outline', label: 'Profile', route: '/profile' },
  ];

  // Owner navigation items
  const ownerItems = [
    { id: 1, icon: 'home', iconOutline: 'home-outline', label: 'Home', route: '/dashboard' },
    { id: 2, icon: 'search', iconOutline: 'search-outline', label: 'Search', route: '/vehicles/search' },
    { id: 3, icon: 'heart', iconOutline: 'heart-outline', label: 'Favorites', route: '/favorites' },
    { id: 4, icon: 'calendar', iconOutline: 'calendar-outline', label: 'Bookings', route: '/bookings' },
    { id: 5, icon: 'person', iconOutline: 'person-outline', label: 'Profile', route: '/profile' },
  ];

  const items = userRole === 'owner' ? ownerItems : customerItems;

  const handleNavigation = (route) => {
    router.push(route);
  };

  const isActive = (route) => {
    return pathname === route;
  };

  return (
    <View className="bg-white border-t border-gray-200">
      <View className="flex-row justify-around items-center py-2 px-4">
        {items.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              className="items-center justify-center py-2 px-3 flex-1"
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons
                name={active ? item.icon : item.iconOutline}
                size={24}
                color={active ? '#3b82f6' : '#9ca3af'}
              />
              <Text
                className={`text-xs mt-1 ${
                  active ? 'text-blue-500 font-semibold' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
