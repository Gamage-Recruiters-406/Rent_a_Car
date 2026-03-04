import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function VerifyCodePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || '';
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async () => {
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}${apiVersion}/authUser/verifyOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Verification code verified successfully');
        router.push({
          pathname: '/login/fogotpassword/reset-password',
          params: { email }
        });
      } else {
        Alert.alert('Error', data.message || 'Invalid code');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error or server is unreachable');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      const response = await fetch(`${baseUrl}${apiVersion}/authUser/passwordRestOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Verification code resent to your email');
        setCountdown(60); // Set countdown to 60 seconds
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
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
              <Text className="text-3xl font-bold text-gray-900">Enter verification code</Text>
              <Text className="text-gray-500">We sent a code to {email}</Text>
            </View>

            <View className="space-y-6">
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-900">Verification Code</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-[#F3F4F6] rounded-lg text-gray-900 text-lg tracking-widest text-center"
                  placeholder="123456"
                  placeholderTextColor="#6B7280"
                  maxLength={6}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
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
                  <Text className="text-white font-medium text-lg">Verify Code</Text>
                )}
              </TouchableOpacity>

              <View className="items-center gap-4">
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600">Didn't receive the code? </Text>
                  <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                    <Text className={`font-medium ${countdown > 0 ? 'text-gray-400' : 'text-[#0A2E5C]'}`}>
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                  <ArrowLeft size={20} color="#4B5563" className="mr-2" />
                  <Text className="text-base font-medium text-gray-600">Back based to Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
