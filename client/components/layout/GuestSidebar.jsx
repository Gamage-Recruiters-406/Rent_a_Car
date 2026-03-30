import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const whiteLogo = require('../../assets/images/Rent My Car.png');

/**
 * GuestSidebar Component - Sidebar menu for non-logged-in users
 * Shows basic navigation and login/signup buttons
 */
export default function GuestSidebar({ isVisible, onClose }) {
  const router = useRouter();
  const [activeItemId, setActiveItemId] = useState(1);

  const menuItems = [
    { id: 1, icon: 'home-outline', label: 'Home', route: '/' },
    { id: 2, icon: 'car-outline', label: 'Browse Cars', route: '/CustomerVehicleList' },
    { id: 3, icon: 'call-outline', label: 'Contact Us', route: '/(tabs)/contact' },
  ];

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  const handleLogin = () => {
    onClose();
    router.push('/login/SignInPage');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/login/SignUpPage');
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        {/* Sidebar Container */}
        <View
          style={{
            width: '75%',
            height: '100%',
            backgroundColor: '#0A2E5C',
          }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Header */}
            <View className="bg-[#0A2E5C] px-4 pt-6 pb-4 border-b border-blue-400">
              <View className="flex-row items-center mb-6">
                <Image
                  source={whiteLogo}
                  className="w-8 h-8 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-white text-xl font-bold">Rent My Car</Text>
              </View>

              {/* Login/Signup Buttons for Guest */}
              <View className="gap-3">
                <TouchableOpacity
                  onPress={handleLogin}
                  className="bg-white rounded-lg py-3 items-center"
                >
                  <Text className="text-[#0A2E5C] font-semibold">Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSignUp}
                  className="bg-transparent border-2 border-white rounded-lg py-3 items-center"
                >
                  <Text className="text-white font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <View className="px-4 py-6">
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleNavigate(item.route)}
                  className={`flex-row items-center py-4 px-3 rounded-lg mb-2 ${
                    activeItemId === item.id ? 'bg-blue-500' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={activeItemId === item.id ? '#FFFFFF' : '#FFFFFF'}
                  />
                  <Text
                    className={`ml-4 text-base font-medium ${
                      activeItemId === item.id ? 'text-white' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Overlay to close sidebar when tapped */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
