import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { API_CONFIG, getApiUrl } from '../constants/api-config';

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
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      setIsLoading(false);
      return;
    }

    try {
      const url = getApiUrl('/authUser/register');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Registration successful! Please verify your email');
        router.push('/sign-in');
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white">
      <View className="flex-1 flex-col lg:flex-row">
        {/* Top/Left Panel - Brand & Hero */}
        <View className="w-full lg:w-[40%] bg-[#0A2E5C] p-8 lg:p-12 flex flex-col justify-between min-h-[300px] lg:min-h-screen relative overflow-hidden">
          <View className="flex flex-row items-center gap-3">
             <Text className="text-white font-bold text-2xl">RMC</Text>
            <Text className="text-xl font-medium tracking-wide text-white">Rent My Car</Text>
          </View>

          <View className="my-12 lg:my-0 relative z-10">
            <Text className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
              Drive your dreams today.
            </Text>
            <Text className="text-blue-100 text-lg leading-relaxed max-w-md">
              Experience the freedom of the open road with our premium fleet.
              Reliable, comfortable, and ready when you are.
            </Text>
          </View>

          <Text className="text-sm text-blue-300/80">
            © 2026 Rent My Car. All rights reserved.
          </Text>
        </View>

        {/* Bottom/Right Panel - Form Content */}
        <View className="w-full lg:w-[60%] bg-white flex flex-col justify-center items-center p-6 lg:p-12">
          <View className="w-full max-w-md space-y-8">
            <View className="space-y-2 mb-6">
              <Text className="text-3xl font-bold text-gray-900">Create an account</Text>
              <Text className="text-gray-500">Start your journey with us today.</Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-4">
                {/* Name Fields */}
                <View className="flex flex-col lg:flex-row gap-4">
                   <View className="flex-1 space-y-2">
                    <Text className="text-sm font-medium text-gray-900">First Name</Text>
                    <TextInput
                      placeholder="John"
                      placeholderTextColor="#6b7280"
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900"
                      value={formData.first_name}
                      onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                    />
                  </View>
                  <View className="flex-1 space-y-2">
                    <Text className="text-sm font-medium text-gray-900">Last Name</Text>
                    <TextInput
                      placeholder="Doe"
                      placeholderTextColor="#6b7280"
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900"
                      value={formData.last_name}
                      onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                    />
                  </View>
                </View>

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Email</Text>
                  <TextInput
                    placeholder="john@example.com"
                    placeholderTextColor="#6b7280"
                    className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Phone</Text>
                  <TextInput
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#6b7280"
                    className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900"
                    value={formData.contactNumber}
                    onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Password</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Create a password"
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

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Confirm Password</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Confirm your password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showConfirmPassword}
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-transparent focus:bg-white focus:border-blue-600 rounded-lg text-gray-900 pr-10"
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                    />
                    <TouchableOpacity
                      className="absolute right-3 top-4"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex flex-row gap-6 pt-2">
                 <TouchableOpacity 
                    className="flex flex-row items-center gap-2"
                    onPress={() => setFormData({...formData, userType: 'owner'})}
                 >
                    <View className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'owner' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>
                      {formData.userType === 'owner' && <View className="w-3 h-3 rounded-full bg-[#0A2E5C]" />}
                    </View>
                    <Text className="text-sm text-gray-700">Vehicle Owner</Text>
                 </TouchableOpacity>

                 <TouchableOpacity 
                    className="flex flex-row items-center gap-2"
                    onPress={() => setFormData({...formData, userType: 'customer'})}
                 >
                    <View className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.userType === 'customer' ? 'border-[#0A2E5C]' : 'border-gray-300'}`}>
                      {formData.userType === 'customer' && <View className="w-3 h-3 rounded-full bg-[#0A2E5C]" />}
                    </View>
                    <Text className="text-sm text-gray-700">Customer</Text>
                 </TouchableOpacity>
              </View>

              <View className="flex flex-row items-center gap-3">
                 <TouchableOpacity 
                    className={`w-4 h-4 rounded border flex items-center justify-center ${formData.agreeTerms ? 'bg-[#0A2E5C] border-[#0A2E5C]' : 'border-gray-300'}`}
                    onPress={() => setFormData({...formData, agreeTerms: !formData.agreeTerms})}
                 >
                    {formData.agreeTerms && <View className="w-2 h-2 bg-white rounded-sm" />}
                 </TouchableOpacity>
                 <Text className="text-sm text-gray-600 flex-1">
                   I agree to the <Text className="text-[#0A2E5C] font-medium">Terms of Service</Text> and <Text className="text-[#0A2E5C] font-medium">Privacy Policy</Text>
                 </Text>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading || !formData.agreeTerms}
                className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg items-center ${isLoading || !formData.agreeTerms ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                   <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium text-lg">Create account</Text>
                )}
              </TouchableOpacity>

              <View className="flex flex-row justify-center mt-4">
                <Text className="text-sm text-gray-500">Already have an account? </Text>
                <Link href="/sign-in" asChild>
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
  );
}
