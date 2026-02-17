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

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ padding: 10, alignItems: 'center' }}>
        <Link href="/vehicle_booking" asChild>
          <TouchableOpacity style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Go to Vehicle Booking</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <Hero />
      <Stats />
      <Items />
      <QuickStats />
      <NewsLetter />
      <Testimonials />
    </ScrollView>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
