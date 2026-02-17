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
            <View style={styles.buttonWrapper}>
              <Link href="/CustomerVehicleList" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Go to Vehicle List</Text>
                </TouchableOpacity>
              </Link>
            </View>
            <Hero />
            <Stats />
          <Items />
            <QuickStats/>
            <NewsLetter />
          <Testimonials/>
          </ScrollView>
  );
 
}
 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
    buttonWrapper: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    button: {
      backgroundColor: '#0D3778',
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
});
