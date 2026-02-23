import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}${apiVersion}/authUser/passwordRestOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP sent successfully');
        // Navigate to verify code page
        router.push({
          pathname: '/login/fogotpassword/verify-code',
          params: { email }
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server is unreachable');
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
              <Text className="text-3xl font-bold text-gray-900">Forgot your password?</Text>
              <Text className="text-gray-500">Enter your email to receive a verification code.</Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-900">Email Address</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900"
                  placeholder="name@example.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`w-full bg-[#0A2E5C] py-3 px-4 rounded-lg flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-medium text-lg">Send Code</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Link href="/login/SignInPage" asChild>
                  <TouchableOpacity className="flex-row items-center">
                    <ArrowLeft size={20} color="#4B5563" className="mr-2" />
                    <Text className="text-base font-medium text-gray-600 hover:text-[#0A2E5C]">Back to Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
