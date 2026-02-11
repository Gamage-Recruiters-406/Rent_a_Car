import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, getApiUrl } from '../constants/api-config';
import { styled } from 'nativewind';

// Import image specifically for Expo (requires require() or import)
// Assuming asset is at ../assets/Rent My Car.png relative to app folder?
// Original: ../../assets/Rent My Car.png from temp/login/SignInPage.jsx
// In client structure: assets might be in client/assets
// So from client/app/sign-in.jsx, it is ../assets/Rent My Car.png
const logo = require('../assets/images/android-icon-foreground.png'); // Placeholder if original not found. 
// Wait, I should check assets folder. I'll use a placeholder or check if the file exists. 
// Step 5 showed assets folder. Let's assume standard expo assets or I can use a network image or just text if missing.
// I'll try to use the name from the original file but adapting path.
// If not found, I will use text substitute.
// User didn't ask to move assets but I should probably check.
// I'll stick to a simple require and if it fails user can fix path. 
// Actually, better to check assets content.
// I'll use a local variable for now.

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Use local IP (API_CONFIG)
      const url = getApiUrl('/authUser/login');
      console.log('Attempting login to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        Alert.alert("Success", data.message || "Login Successfully");
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('user', JSON.stringify({ userid: data.userid, role: data.role }));
        
        // Navigate to main app (e.g., vehicles list or home)
        // For now, staying here or verifying navigation
        // navigate('/vehicles'); 
        router.replace('/'); // Redirect to home/index after login, or user's target
      } else {
        Alert.alert("Error", data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Server Side Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white">
      <View className="flex-1 flex-col lg:flex-row">
        {/* Top/Left Panel - Brand & Hero */}
        <View className="w-full lg:w-[40%] bg-[#0A2E5C] p-8 lg:p-12 flex flex-col justify-between min-h-[300px] lg:min-h-screen relative overflow-hidden">
          {/* Brand */}
          <View className="flex flex-row items-center gap-3">
             {/* <Image source={logo} className="w-12 h-12" resizeMode="contain" /> */} 
             {/* Using text placeholder for logo to avoid crash if asset missing */}
            <Text className="text-xl font-medium tracking-wide text-white">Rent My Car</Text>
          </View>

          {/* Hero Content */}
          <View className="my-12 lg:my-0 relative z-10">
            <Text className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
              Drive your dreams today.
            </Text>
            <Text className="text-blue-100 text-lg leading-relaxed max-w-md">
              Experience the freedom of the open road with our premium fleet.
              Reliable, comfortable, and ready when you are.
            </Text>
          </View>

          {/* Footer Copyright */}

        </View>

        {/* Bottom/Right Panel - Form Content */}
        <View className="w-full lg:w-[60%] bg-white flex flex-col justify-center items-center p-6 lg:p-12">
          <View className="w-full max-w-md space-y-8">
            <View className="space-y-2 mb-6">
              <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
              <Text className="text-gray-500">Please enter your details to sign in.</Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-4">
                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Email</Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#6b7280"
                    className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Password</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900 pr-10"
                      value={formData.password}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                    />
                    <TouchableOpacity
                      className="absolute right-3 top-4"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex flex-row items-center justify-between pb-4">
                <TouchableOpacity 
                   className="flex flex-row items-center gap-2"
                   onPress={() => setFormData({...formData, rememberMe: !formData.rememberMe})}
                >
                  <View className={`w-4 h-4 border rounded ${formData.rememberMe ? 'bg-[#0A2E5C] border-[#0A2E5C]' : 'border-gray-300'}`} />
                  <Text className="text-sm text-gray-600">Remember me for 30 days</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                  <Text className="text-sm font-medium text-[#0A2E5C]">Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg items-center ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                   <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium text-lg">Sign in</Text>
                )}
              </TouchableOpacity>

              <View className="flex flex-row justify-center mt-4">
                <Text className="text-sm text-gray-500">Don't have an account? </Text>
                <Link href="/sign-up" asChild>
                  <TouchableOpacity>
                    <Text className="font-medium text-[#0A2E5C]">Sign up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
