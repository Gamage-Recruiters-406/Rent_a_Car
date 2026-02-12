import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-center text-blue-500">
        Welcome to Rent a Car Mobile
      </Text>
      <Text className="text-lg text-green-600 mt-4">
        Tailwind is running
      </Text>
    </View>
  );
}
