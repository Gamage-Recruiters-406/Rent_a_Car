import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const logo = require('../../assets/images/Rent My Car.png');

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'customer',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.contactNumber || !formData.password) {
       Alert.alert('Error', 'Please fill in all required fields');
       return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (!formData.agreeTerms) {
      Alert.alert('Error', 'You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const url = `${baseUrl}${apiVersion}/authUser/register`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Registration successful! Please verify your email', [
            { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        // router.replace('/login'); // Moved to Alert callback
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration failed:', response.status, errorData);
        Alert.alert('Error', `Registration failed: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 flex-col lg:flex-row">
          {/* Brand & Hero Section */}
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
                <Text className="text-3xl font-bold text-gray-900">Create an account</Text>
                <Text className="text-gray-500">Start your journey with us today.</Text>
              </View>

              <View className="space-y-6">
                <View className="space-y-4">
                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">First Name</Text>
                    <TextInput
                      className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                      placeholder="John"
                      placeholderTextColor="#6B7280"
                      value={formData.first_name}
                      onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                    />
                  </View>
                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Last Name</Text>
                    <TextInput
                      className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                      placeholder="Doe"
                      placeholderTextColor="#6B7280"
                      value={formData.last_name}
                      onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                    />
                  </View>

                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Email</Text>
                    <TextInput
                      className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                      placeholder="john@example.com"
                      placeholderTextColor="#6B7280"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                    />
                  </View>

                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Phone</Text>
                    <TextInput
                      className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                      placeholder="+1 (555) 000-0000"
                      placeholderTextColor="#6B7280"
                      keyboardType="phone-pad"
                      value={formData.contactNumber}
                      onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                    />
                  </View>

                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Password</Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900 pr-12"
                        placeholder="Create a password"
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
                    <Text className="text-xs text-gray-500">Must be at least 8 characters</Text>
                  </View>

                  <View className="space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Confirm Password</Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900 pr-12"
                        placeholder="Confirm your password"
                        placeholderTextColor="#6B7280"
                        secureTextEntry={!showConfirmPassword}
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 p-2"
                      >
                        {showConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* User Type Selection */}
                <View className="flex-row gap-6 pt-2">
                  <TouchableOpacity 
                    className="flex-row items-center gap-2"
                    onPress={() => setFormData({ ...formData, userType: 'owner' })}
                  >
                    <View className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'owner' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>
                      {formData.userType === 'owner' && <View className="w-3 h-3 rounded-full bg-[#0A2E5C]" />}
                    </View>
                    <Text className="text-sm text-gray-700">Vehicle Owner</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex-row items-center gap-2"
                    onPress={() => setFormData({ ...formData, userType: 'customer' })}
                  >
                    <View className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'customer' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>
                      {formData.userType === 'customer' && <View className="w-3 h-3 rounded-full bg-[#0A2E5C]" />}
                    </View>
                    <Text className="text-sm text-gray-700">Customer</Text>
                  </TouchableOpacity>
                </View>

                {/* Terms Agreement */}
                <TouchableOpacity 
                  className="flex-row items-start gap-3"
                  onPress={() => setFormData({ ...formData, agreeTerms: !formData.agreeTerms })}
                >
                  <View className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${formData.agreeTerms ? 'bg-[#0A2E5C] border-[#0A2E5C]' : 'border-gray-300'}`}>
                     {formData.agreeTerms && <View className="w-2 h-2 bg-white rounded-sm" />} 
                  </View>
                  <Text className="text-sm text-gray-600 flex-1">
                    I agree to the <Text className="text-[#0A2E5C] font-medium">Terms of Service</Text> and <Text className="text-[#0A2E5C] font-medium">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-medium text-center">Create account</Text>
                  )}
                </TouchableOpacity>

                <View className="flex-row justify-center gap-1">
                  <Text className="text-sm text-gray-500">If have an already account?</Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text className="font-medium text-[#0A2E5C]">Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

