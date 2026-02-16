// client/components/ui/QuickStats.tsx (Enhanced Version)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickStat {
  icon: keyof typeof Ionicons.glyphMap;
  number: string;
  label: string;
}

export const QuickStats = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

  const quickStats: QuickStat[] = [
    { icon: 'flash', number: 'Instant', label: 'Booking Confirmation' },
    { icon: 'pricetag', number: '40%', label: 'Cheaper Than Traditional' },
    { icon: 'time', number: '2 Min', label: 'Average Signup Time' },
    { icon: 'checkmark-circle', number: '100%', label: 'Verified Vehicles' },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...quickStats, ...quickStats, ...quickStats];

  // Responsive sizing based on screen width
  const getStatWidth = () => {
    if (dimensions.width < 375) {
      return dimensions.width * 0.6; // Smaller phones
    } else if (dimensions.width < 414) {
      return dimensions.width * 0.55; // Medium phones
    } else {
      return dimensions.width * 0.5; // Larger phones & tablets
    }
  };

  const STAT_WIDTH = getStatWidth();
  const TOTAL_WIDTH = STAT_WIDTH * quickStats.length;

  // Handle orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Right to left animation
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: TOTAL_WIDTH,
        duration: 20000, // 20 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [TOTAL_WIDTH]);

  // Responsive font sizes
  const getFontSizes = () => {
    if (dimensions.width < 375) {
      return { number: 24, label: 11, icon: 24 };
    } else if (dimensions.width < 414) {
      return { number: 26, label: 12, icon: 26 };
    } else {
      return { number: 28, label: 13, icon: 28 };
    }
  };

  const fontSizes = getFontSizes();

  return (
    <LinearGradient
      colors={['#0d3778', '#1a4d99']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.marqueeContainer}>
        <Animated.View
          style={[
            styles.statsRow,
            {
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [0, TOTAL_WIDTH],
                    outputRange: [0, -TOTAL_WIDTH],
                  }),
                },
              ],
            },
          ]}
        >
          {duplicatedStats.map((stat, index) => (
            <View key={index} style={[styles.statItem, { width: STAT_WIDTH }]}>
              <View style={styles.statContent}>
                <View style={styles.numberRow}>
                  <Ionicons name={stat.icon} size={fontSizes.icon} color="#fff" />
                  <Text style={[styles.number, { fontSize: fontSizes.number }]}>
                    {stat.number}
                  </Text>
                </View>
                <Text 
                  style={[styles.label, { fontSize: fontSizes.label }]} 
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  {stat.label}
                </Text>
              </View>
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
    marginBottom:16,
    overflow: 'hidden',
  },
  marqueeContainer: {
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  number: {
    fontWeight: 'bold',
    color: '#fff',
    ...Platform.select({
      ios: {
        fontWeight: '700',
      },
      android: {
        fontWeight: 'bold',
      },
    }),
  },
  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
  },
});