import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Hero } from "../../components/ui/Hero";
import { Stats } from "../../components/ui/Stats";
import { Items } from "../../components/ui/Items";
import { NewsLetter } from "../../components/ui/NewsLetter";
import { QuickStats } from "../../components/ui/Quickstats";
import { Testimonials } from "../../components/ui/Testimonials";
import AppLayout from "../../components/layout/Layout";

// Import your UI components

export default function HomePage() {
  const router = useRouter();

  return (
    <AppLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Hero />
        <Stats />
        <Items />
        <QuickStats />
        <NewsLetter />
        <Testimonials />

        {/* Add some bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bottomPadding: {
    height: 32,
  },
});
