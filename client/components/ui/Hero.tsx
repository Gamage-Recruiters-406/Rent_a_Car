// client/components/ui/Hero.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export const Hero = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const floatingValue = useSharedValue(0);

  useEffect(() => {
    // Floating animation
    floatingValue.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Simulate loading
    const timer = setTimeout(() => {
      setImageLoaded(true);
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingValue.value * -30 }],
    };
  });

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#0d3778', '#1a4d99']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={60} color="#fff" />
            <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
          </View>
          
          <Animated.View entering={FadeInUp.delay(300)}>
            <Text style={styles.loadingText}>
              Loading Your Journey
            </Text>
          </Animated.View>
          
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotDelay1]} />
            <View style={[styles.dot, styles.dotDelay2]} />
            <View style={[styles.dot, styles.dotDelay3]} />
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&h=900&fit=crop',
      }}
      style={styles.heroContainer}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(13, 55, 120, 0.6)', 'rgba(26, 77, 153, 0.6)']}
        style={styles.overlay}
      >
        <Animated.View 
          entering={FadeInDown.delay(300).duration(700)}
          style={styles.contentContainer}
        >
          <Animated.Text 
            entering={FadeInDown.delay(500).duration(700)}
            style={styles.title}
          >
            Your Perfect Ride Awaits
          </Animated.Text>
          
          <Animated.Text 
            entering={FadeInDown.delay(700).duration(700)}
            style={styles.subtitle}
          >
            Discover amazing vehicles from trusted owners in your area. 
            Rent by the day or week at unbeatable prices.
          </Animated.Text>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinner: {
    position: 'absolute',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  dotDelay1: {
    // Add animation in reanimated if needed
  },
  dotDelay2: {
    // Add animation in reanimated if needed
  },
  dotDelay3: {
    // Add animation in reanimated if needed
  },
  heroContainer: {
    height: height * 0.6,
    width: width,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.85,
  },
});