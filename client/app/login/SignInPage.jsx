import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const logo = require('../../assets/images/Rent My Car.png');

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

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
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);


    try {
      const url = `${baseUrl}${apiVersion}/authUser/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        //credentials: 'include',
      });

      const data = await response.json();
      console.log('Login API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        // Store token logic
        try {
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userId', data.userid);
          if (data.role) await AsyncStorage.setItem('userRole', String(data.role));
          if (data.status) await AsyncStorage.setItem('userStatus', data.status);
        } catch (e) {
          console.error('Failed to save user data', e);
        }

        Alert.alert('Success', data.message || "Login Successfully");
        router.replace('/vehicle_booking'); 
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || "Server Side Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerClassName="flex-grow pb-24">
        <View className="flex-1 flex-col lg:flex-row">
          {/* Brand & Hero Section (simulated with View/Image for mobile check later) */}
          <View className="bg-[#0A2E5C] p-8 flex-col justify-between min-h-[300px]">
            <View className="flex-row items-center gap-3">
              <Image source={logo} className="w-12 h-12" resizeMode="contain" />
              <Text className="text-xl font-medium tracking-wide text-white">Rent My Car</Text>
            </View>

            <View className="my-8">
              <Text className="text-4xl font-bold leading-tight mb-6 text-white">
                Drive your dreams today.
              </Text>
              <Text className="text-blue-100 text-lg leading-relaxed">
                Experience the freedom of the open road with our premium fleet.
                Reliable, comfortable, and ready when you are.
              </Text>
            </View>
            
            <Text className="text-sm text-blue-300/80">
              © 2026 Rent My Car. All rights reserved.
            </Text>
          </View>

          {/* Form Content */}
          <View className="flex-1 bg-white p-6 justify-center">
            <View className="w-full max-w-md mx-auto space-y-8">
              <View className="space-y-2">
                <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
                <Text className="text-gray-500">Please enter your details to sign in.</Text>
              </View>

              <View className="space-y-6">
                <View className="space-y-4">
                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Email</Text>
                    <TextInput
                      className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                      placeholder="Enter your email"
                      placeholderTextColor="#6B7280"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                    />
                  </View>

                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Password</Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900 pr-12"
                        placeholder="••••••••"
                        placeholderTextColor="#6B7280"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-2"
                      >
                        {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <TouchableOpacity 
                    className="flex-row items-center gap-2"
                    onPress={() => setFormData({ ...formData, rememberMe: !formData.rememberMe })}
                  >
                    <View className={`w-4 h-4 border rounded ${formData.rememberMe ? 'bg-[#0A2E5C] border-[#0A2E5C]' : 'border-gray-300'}`} />
                    <Text className="text-sm text-gray-600">Remember me for 30 days</Text>
                  </TouchableOpacity>

                  <Link href="/login/fogotpassword/fogotindex" asChild>
                    <TouchableOpacity>
                      <Text className="text-sm font-medium text-[#0A2E5C]">Forgot password?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">Sign in</Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center gap-1">
                  <Text className="text-sm text-gray-500">Don't have an account?</Text>
                   <Link href="/login/SignUpPage"asChild>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


    