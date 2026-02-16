import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 414;

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-4 sm:px-6">
        <Text
          className={`font-bold text-center text-gray-800 mb-2 ${
            isSmallScreen
              ? "text-2xl"
              : isMediumScreen
                ? "text-3xl"
                : "text-4xl"
          }`}
        >
          Welcome to Rent a Car
        </Text>
        <Text
          className={`text-gray-600 mb-8 text-center max-w-sm ${
            isSmallScreen ? "text-base mb-6" : "text-lg mb-12"
          }`}
        >
          Your premium car rental experience
        </Text>

        <Link href="/login/SignInPage" asChild>
          <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
            <Text className="text-white font-semibold text-lg text-center">
              Login
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/owner/rental-history" asChild>
          <TouchableOpacity
            className="bg-[#0A2E5C] rounded-lg shadow-lg mb-6 w-full mt-6"
            style={{
              maxWidth: Math.min(width - 32, 400),
              paddingVertical: isSmallScreen ? 12 : 16,
              paddingHorizontal: isSmallScreen ? 24 : 32,
              minHeight: 48, // iOS minimum touch target
            }}
          >
            <Text
              className={`text-white font-semibold text-center ${
                isSmallScreen ? "text-base" : "text-lg"
              }`}
            >
              View Rental History
            </Text>
          </TouchableOpacity>
        </Link>

        <View className="mt-4">
          <Text
            className={`text-green-600 text-center ${
              isSmallScreen ? "text-xs" : "text-sm"
            }`}
          >
            ✓ NativeWind is configured
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
