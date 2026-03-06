import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Hero } from "../components/ui/Hero";
import { Stats } from "../components/ui/Stats";
import { Testimonials } from "../components/ui/Testimonials";
import { NewsLetter } from "../components/ui/NewsLetter";
import { Items } from "../components/ui/Items";
import { QuickStats } from "../components/ui/Quickstats";
import AppLayout from "../components/layout/Layout";

export default function HomeScreen() {
  return (
    <ScrollView
    // style={styles.container}
    // showsVerticalScrollIndicator={false}
    >
      {/*The temporary buttons shown in the mobile view cannot navigate to actual URLs. These buttons are only added for testing 
          and demonstration purposes of navigation flow.
          pleas donot delet this buttons. after connect every part then delet this buttons*/}

   {/*   <Link href="/login/SignInPage" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Login
          </Text>
        </TouchableOpacity>
      </Link> */}
     {/*  <Link href="/Reviews" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Reviews
          </Text>
        </TouchableOpacity>
      </Link> */}
     {/*<Link href="/MyReviews" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            My Reviews
          </Text>
        </TouchableOpacity>
      </Link> */}

    {/* <View style={styles.buttonWrapper}>
        <Link href="/CustomerVehicleList" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Go to Vehicle List</Text>
          </TouchableOpacity>
        </Link>
      </View>  */}

      <Link href="/vehicle_booking" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            VEHICLE BOOKING
          </Text>
        </TouchableOpacity>
      </Link>

     {/* <Link href="/owner/rental-history" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            owner rental history
          </Text>
        </TouchableOpacity>
      </Link>  */}

     {/* <Link href="/Cus_booking-history/booking-history" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            {" "}
            BOOKING History
          </Text>
        </TouchableOpacity>
      </Link> */}

    { /*  <Link href="/admin/settings" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            admin setting
          </Text>
        </TouchableOpacity>
      </Link> */}

      <Link href="/vehicle/6981d6ae24ec9900bf582a54" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            vehicle details
          </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/booking" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Owner Booking Request
          </Text>
        </TouchableOpacity>
      </Link>

   { /*  <Link href="/owner/my-vehicle" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Owner My Vehicles
          </Text>
        </TouchableOpacity>
      </Link> 

      <Link href="/owner/owner-dashboard" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            {" "}
            Owner Dashboard
          </Text>
        </TouchableOpacity>
      </Link> */}

     {/* <Link href="/contact" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            {" "}
            Contact
          </Text>
        </TouchableOpacity>
      </Link> */}

 {/*     <Link href="/owner/AddVehicle" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Add Vehicle
          </Text>
        </TouchableOpacity>
      </Link>  */}

      <Link href="/owner/EditVehicleOwner" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">
            Edit Vehicle
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        onPress={async () => {
          const keys = ["userToken", "userId", "userRole"];
          const result = await AsyncStorage.multiGet(keys);
          const message = result
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
          Alert.alert("Stored Data", message || "No data found");
        }}
        className="bg-green-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64"
      >
        <Text className="text-white font-semibold text-lg text-center">
          Check Stored Data
        </Text>
      </TouchableOpacity>

     {/*   <View className="bg-gray-100 p-6 rounded-2xl mt-6 shadow-sm w-72 items-center">
        <Text className="text-[#0A2E5C] font-bold text-lg mb-4">Profiles</Text>
        <Link href="/profilepages/CustomerProfileEdit" asChild>
          <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg w-full mb-3 shadow-sm">
            <Text className="text-white font-semibold text-center">
              Customer Profile
            </Text>
          </TouchableOpacity>
        </Link>

       {/* <Link href="/profilepages/OwnerProfileEdit" asChild>
          <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg w-full shadow-sm">
            <Text className="text-white font-semibold text-center">
              Owner Profile
            </Text>
          </TouchableOpacity>
        </Link>
      </View>  */}

      <AppLayout>
        <Hero />
        <Stats />
        <Items />
        <QuickStats />
        <NewsLetter />
        <Testimonials />
      </AppLayout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  button: {
    backgroundColor: "#0D3778",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
