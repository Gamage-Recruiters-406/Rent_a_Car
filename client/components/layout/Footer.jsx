import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

/**
 * Footer Component - Bottom navigation for customers and owners
 * Same footer for both roles - different routes handled by pages
 */
export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items for footer (same for both customer and owner)
  const footerItems = [
    { id: 1, icon: 'home', iconOutline: 'home-outline', label: 'Home', route: '/home' },
    { id: 2, icon: 'search', iconOutline: 'search-outline', label: 'Search', route: '/vehicles/search' },
    { id: 3, icon: 'heart', iconOutline: 'heart-outline', label: 'Favorites', route: '/favorites' },
    { id: 4, icon: 'calendar', iconOutline: 'calendar-outline', label: 'Bookings', route: '/bookings' },
    { id: 5, icon: 'person', iconOutline: 'person-outline', label: 'Profile', route: '/profile' },
  ];

  const handleNavigation = (route) => {
    router.push(route);
  };

  const isActive = (route) => {
    return pathname === route;
  };

  return (
    <View className="bg-white border-t border-blue-200 shadow-lg">
      <View className="flex-row justify-between items-center py-3 px-2">
        {footerItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.id}
              className="items-center justify-center py-2 px-3 flex-1"
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.6}
            >
              <Ionicons
                name={active ? item.icon : item.iconOutline}
                size={24}
                color={active ? '#3b82f6' : '#cbd5e1'}
              />
              <Text
                className={`text-[10px] mt-1 text-center ${
                  active ? 'text-blue-500 font-semibold' : 'text-slate-400'
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
