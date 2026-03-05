import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeIndex() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to homepage
    // This makes /Home route go to /Home/homepage
    router.replace('/Home');
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0d3778" />
    </View>
  );
}