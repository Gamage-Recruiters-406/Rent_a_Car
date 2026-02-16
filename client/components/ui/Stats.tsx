// client/components/ui/Stats.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const baseUrl = 'http://localhost:8090';
const apiVersion =  '/api/v1';

interface Stat {
  icon: keyof typeof Ionicons.glyphMap;
  number: string;
  value: number;
  label: string;
  isDecimal?: boolean;
}

export const Stats = () => {
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(4.9);

  const scrollX = useRef(new Animated.Value(0)).current;

  const stats: Stat[] = [
    {
      icon: 'car-sport',
      number: `${vehicleCount}+`,
      value: vehicleCount,
      label: 'Vehicles Available',
    },
    {
      icon: 'people',
      number: `${userCount}+`,
      value: userCount,
      label: 'Happy Customers',
    },
    {
      icon: 'location',
      number: '25+',
      value: 25,
      label: 'Cities Covered',
    },
    {
      icon: 'star',
      number: '4.9',
      value: averageRating,
      label: 'Average Rating',
      isDecimal: true,
    },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...stats, ...stats, ...stats];

  const STAT_WIDTH = SCREEN_WIDTH * 0.5; // Each stat takes 50% of screen width
  const TOTAL_WIDTH = STAT_WIDTH * stats.length;

  // Fetch vehicle count
  useEffect(() => {
    const fetchVehicleCount = async () => {
      try {
        setIsLoading(true);
        const url = `${baseUrl}${apiVersion}/vehicle/vehicle-count`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle count');
        }

        const data = await response.json();

        if (data.success && typeof data.count === 'number') {
          setVehicleCount(data.count);
        } else {
          setVehicleCount(0);
        }
      } catch (error) {
        console.error('Error fetching vehicle count:', error);
        setVehicleCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleCount();
  }, []);

  // Fetch user count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const url = `${baseUrl}${apiVersion}/authUser/getAllCustomersCount`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user count');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.users)) {
          setUserCount(data.users.length);
        } else {
          setUserCount(0);
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
        setUserCount(0);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch average rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const url = `${baseUrl}${apiVersion}/reviews/overall-average`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.statistics?.averageRating) {
            setAverageRating(data.statistics.averageRating);
          }
        }
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    fetchAverageRating();
  }, []);

  // Animate stats counter (counting up effect)
  useEffect(() => {
    if (isLoading) return;

    const duration = 2000; // 2 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = duration / frameRate;
    const intervals: number[] = [];

    stats.forEach((stat, index) => {
      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = easeOutQuart * stat.value;

        setCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[index] = currentValue;
          return newCounts;
        });

        if (frame >= totalFrames) {
          clearInterval(counter);
          setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[index] = stat.value;
            return newCounts;
          });
        }
      }, frameRate);

      intervals.push(counter);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isLoading, vehicleCount, userCount, averageRating]);

  // ✅ INFINITE MARQUEE ANIMATION - NEVER STOPS
  useEffect(() => {
    if (isLoading) return;

    // Start the infinite loop animation
    const loopAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: TOTAL_WIDTH,
        duration: 15000, // 15 seconds for one complete cycle
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loopAnimation.start();

    // Cleanup: stop animation when component unmounts
    return () => {
      loopAnimation.stop();
    };
  }, [isLoading, TOTAL_WIDTH, scrollX]);

  const formatNumber = (value: number, isDecimal?: boolean) => {
    if (isDecimal) {
      return value.toFixed(1);
    }
    return Math.floor(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0d3778" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          {duplicatedStats.map((stat, index) => {
            const statIndex = index % stats.length;
            
            return (
              <View key={index} style={[styles.statItem, { width: STAT_WIDTH }]}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['#0d3778', '#1a4d99']}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={stat.icon} size={28} color="#fff" />
                  </LinearGradient>

                  <View style={styles.statContent}>
                    <Text style={styles.statNumber}>
                      {formatNumber(counts[statIndex], stat.isDecimal)}
                      {stat.isDecimal ? '' : '+'}
                    </Text>
                    <Text style={styles.statLabel} numberOfLines={2}>
                      {stat.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  marqueeContainer: {
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d3778',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontWeight: '700',
      },
      android: {
        fontWeight: 'bold',
      },
    }),
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.4,
    lineHeight: 16,
  },
});