import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stats } from '../../components/ui/Stats';
import { Hero } from '../../components/ui/Hero';
import { Items } from '../../components/ui/Items';
import { QuickStats } from '../../components/ui/Quickstats';
import { Testimonials } from '../../components/ui/Testimornials';
import { NewsLetter } from '../../components/ui/NewsLetter';

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
