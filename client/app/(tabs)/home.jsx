import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white p-6 justify-center items-center">
      {/* Welcome Message */}
      <View className="items-center">
        <Text className="text-gray-400 text-lg font-medium">Hello, Welcome!</Text>
        <Text className="text-4xl font-bold text-slate-800 mt-1">Home page</Text>
      </View>
    </View>
  );
}