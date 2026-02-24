
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Phone, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function Header({ activeTab, onNavigate }) {
    const router = useRouter();

    const handleNavigate = (route) => {
        if (onNavigate) {
            onNavigate(route);
        } else {
            if (route === 'home') router.push('/');
            // Add more routes as needed
        }
    };

    return (
        <View className="w-full bg-[#1e3a5f]">
            <View className="flex-row items-center justify-between px-4 h-16">
                <View className="flex-row items-center">
                    {/* Logo/Location */}
                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => handleNavigate('home')}>
                        <MapPin size={20} color="white" />
                        <Text className="text-white font-medium text-base ml-2">
                            Find A Location
                        </Text>
                    </TouchableOpacity>

                    {/* Contact Info (Hidden on small mobile) */}
                    <View className="hidden md:flex flex-row items-center ml-8">
                        <View className="flex-row items-center mr-4">
                            <Phone size={16} color="white" />
                            <Text className="text-white text-sm ml-2">077764224</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Mail size={16} color="white" />
                            <Text className="text-white text-sm ml-2">rentmycar@gmail.com</Text>
                        </View>
                    </View>
                </View>

                {/* Right: CTA Button */}
                <View>
                    <TouchableOpacity
                        onPress={() => handleNavigate('rent')}
                        className={`px-4 py-2 rounded bg-white ${activeTab === 'rent' ? 'border-2 border-[#2563eb]' : ''}`}>
                        <Text className="text-[#1e3a5f] text-sm font-semibold">Rent Your Car</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Mobile Contact Info Bar */}
            <View className="md:hidden bg-[#162c46] px-4 py-2 flex-row justify-between">
                <View className="flex-row items-center">
                    <Phone size={12} color="#d1d5db" />
                    <Text className="text-gray-300 text-xs ml-1">077764224</Text>
                </View>
                <View className="flex-row items-center">
                    <Mail size={12} color="#d1d5db" />
                    <Text className="text-gray-300 text-xs ml-1">rentmycar@gmail.com</Text>
                </View>
            </View>
        </View>
    );
}
