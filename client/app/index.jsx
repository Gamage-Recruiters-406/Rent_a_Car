import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

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
      
      <Link href="/login/SignInPage" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">Login</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/Reviews" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">Reviews</Text>
        </TouchableOpacity>
      </Link>

    </View>
  );
}
