import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const baseUrl = 'http://localhost:8090';
const apiVersion = '/api/v1';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SVG strings for react-native-svg
const svgCheck = `<svg fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>`;

const svgUsers = `<svg fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
</svg>`;

const svgLocation = `<svg fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>`;

const svgStar = `<svg fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
</svg>`;

export const Stats = () => {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(4.9);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const stats = [
    {
      icon: svgCheck,
      number: `${vehicleCount}+`,
      value: vehicleCount,
      label: 'Vehicles Available',
    },
    {
      icon: svgUsers,
      number: `${userCount}+`,
      value: userCount,
      label: 'Happy Customers',
    },
    {
      icon: svgLocation,
      number: '25+',
      value: 25,
      label: 'Cities Covered',
    },
    {
      icon: svgStar,
      number: '4.9',
      value: averageRating,
      label: 'Average Rating',
      isDecimal: true,
    },
  ];

  const duplicatedStats = [...stats, ...stats, ...stats];

  // Fetch vehicle count
  useEffect(() => {
    const fetchVehicleCount = async () => {
      try {
        setIsLoading(true);
        const url = `${baseUrl}${apiVersion}/vehicle/vehicle-count`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch vehicle count');
        const data = await response.json();
        setVehicleCount(data.success && typeof data.count === 'number' ? data.count : 0);
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
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setUserCount(response.ok ? data.length : 0);
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

  // Count-up animation
  useEffect(() => {
    if (isLoading) return;
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = duration / frameRate;
    const intervals = [];

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

    return () => intervals.forEach(clearInterval);
  }, [isLoading, vehicleCount, userCount, averageRating]);

  // Infinite marquee animation using Animated
  const ITEM_WIDTH = SCREEN_WIDTH / 2;
  const TOTAL_WIDTH = ITEM_WIDTH * stats.length; // width of one full set

  useEffect(() => {
    if (isLoading) return;

    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -TOTAL_WIDTH,
        duration: 15000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) animate();
      });
    };

    animate();
    return () => scrollX.stopAnimation();
  }, [isLoading]);

  const formatNumber = (value, isDecimal) => {
    if (isDecimal) return value.toFixed(1);
    return Math.floor(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0d3778" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.marqueeRow,
          { transform: [{ translateX: scrollX }] },
        ]}
      >
        {duplicatedStats.map((stat, index) => {
          const statIndex = index % stats.length;
          return (
            <View key={index} style={[styles.statItem, { width: ITEM_WIDTH }]}>
              {/* Icon box */}
              <View style={styles.iconBox}>
                <SvgXml xml={stat.icon} width={28} height={28} />
              </View>

              {/* Number */}
              <Text style={styles.statNumber}>
                {formatNumber(counts[statIndex], stat.isDecimal)}
                {stat.isDecimal ? '' : '+'}
              </Text>

              {/* Label */}
              <Text style={styles.statLabel} numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    overflow: 'hidden',
  },
  marqueeRow: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0d3778',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0d3778',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
    maxWidth: 120,
    lineHeight: 16,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#4b5563',
  },
});