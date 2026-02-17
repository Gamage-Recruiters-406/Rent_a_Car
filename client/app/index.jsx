import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Hero } from '../components/ui/Hero';
import { Stats } from '../components/ui/Stats';
import { Items } from '../components/ui/Items';
import { QuickStats } from '../components/ui/Quickstats';
import { NewsLetter } from '../components/ui/NewsLetter';
import { Testimonials } from '../components/ui/Testimornials';


export default function HomeScreen() {
  return (

    <ScrollView>

      {/*The temporary buttons shown in the mobile view cannot navigate to actual URLs. These buttons are only added for testing 
          and demonstration purposes of navigation flow.*/}

      <Link href="/login/SignInPage" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">Login</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/vehicle_booking" asChild>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-lg mt-4 shadow-sm w-64">
          <Text className="text-white font-semibold text-lg text-center">Vehicle Booking</Text>
        </TouchableOpacity>
      </Link>

    </ScrollView>

  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
