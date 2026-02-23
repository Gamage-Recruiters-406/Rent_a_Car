import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// ✅ All named exports — must use { }
import { Hero } from '../../components/ui/Hero';
import { Stats } from '../../components/ui/Stats';
import { QuickStats } from '../../components/ui/QuickStats';
import { Items } from '../../components/ui/Items';

import { NewsLetter } from '../../components/ui/NewsLetter';
import { Testimonials } from '../../components/ui/Testimonials';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Hero />
      <Stats />
      <QuickStats />
      <Items />
      <Testimonials />
      <NewsLetter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});