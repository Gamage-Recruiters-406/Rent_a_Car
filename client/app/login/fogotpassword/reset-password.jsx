import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || '';

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}${apiVersion}/authUser/ResetPassword`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: formData.password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password successfully reset!', [
          { text: 'OK', onPress: () => router.replace('/login/SignInPage') }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerClassName="flex-grow p-6 justify-center">
          <View className="max-w-md w-full mx-auto space-y-6">
            <View className="space-y-2">
              <Text className="text-3xl font-bold text-gray-900">Create new password</Text>
              <Text className="text-gray-500">Your new password must be different from previous passwords.</Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-4">
                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">New Password</Text>
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

                <View className="space-y-2">
                  <Text className="text-sm font-medium text-gray-900">Confirm Password</Text>
                  <TextInput
                    className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={true}
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium text-lg">Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
