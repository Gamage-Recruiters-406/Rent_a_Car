import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const QuickStats = () => {
  const translateX = useRef(new Animated.Value(0)).current;

  const quickStats = [
    { icon: '⚡', number: 'Instant', label: 'Booking Confirmation' },
    { icon: '🏷️', number: '40%', label: 'Cheaper Than Traditional' },
    { icon: '⏱️', number: '2 Min', label: 'Average Signup Time' },
    { icon: '✓', number: '100%', label: 'Verified Vehicles' },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...quickStats, ...quickStats, ...quickStats];

  // Responsive sizing
  const getStatWidth = () => {
    if (width < 375) return width * 0.6;
    if (width < 414) return width * 0.55;
    return width * 0.5;
  };

  const getFontSizes = () => {
    if (width < 375) return { number: 24, label: 11, icon: 24 };
    if (width < 414) return { number: 26, label: 12, icon: 26 };
    return { number: 28, label: 13, icon: 28 };
  };

  const statWidth = getStatWidth();
  const fontSizes = getFontSizes();

  // Total width of one set (1/3 of duplicated)
  const totalOneSetWidth = quickStats.length * (statWidth + 48); // 48 = px-6 * 2

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -totalOneSetWidth,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [totalOneSetWidth]);

  return (
    <LinearGradient
      colors={['#0d3778', '#1a4d99']}
      style={styles.container}
    >
      <View style={styles.overflow}>
        <Animated.View
          style={[styles.row, { transform: [{ translateX }] }]}
        >
          {duplicatedStats.map((stat, index) => (
            <View
              key={index}
              style={[styles.statItem, { width: statWidth }]}
            >
              <View style={styles.topRow}>
                <Text style={[styles.icon, { fontSize: fontSizes.icon }]}>
                  {stat.icon}
                </Text>
                <Text style={[styles.number, { fontSize: fontSizes.number }]}>
                  {stat.number}
                </Text>
              </View>
              <Text
                style={[styles.label, { fontSize: fontSizes.label }]}
                numberOfLines={2}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  overflow: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    paddingHorizontal: 24,
    alignItems: 'center',
    flexShrink: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    color: '#fff',
  },
  number: {
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
});