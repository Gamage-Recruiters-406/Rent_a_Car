import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold text-center text-blue-500">
        Welcome to Rent a Car Mobile
      </Text>
      <Text className="text-lg text-green-600 mt-4">
        Tailwind is running
      </Text>

      <TouchableOpacity
        className="mt-6 bg-[#0D3778] px-6 py-3 rounded-xl"
        onPress={() => router.push('/Reviews')}
      >
        <Text className="text-white font-semibold">Go to Reviews</Text>
      </TouchableOpacity>
    </View>
  );
}
