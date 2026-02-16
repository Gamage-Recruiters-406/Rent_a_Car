// client/components/ui/Testimonials.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_MARGIN = 16;

interface Testimonial {
  _id: string;
  rate: number;
  feedback: string;
  customer_id: {
    first_name: string;
    last_name: string;
  };
  createdAt: string;
}

const baseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8090';
const apiVersion = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_VERSION || '/api/v1';

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}${apiVersion}/reviews/home`);

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.reviews)) {
        setTestimonials(data.reviews);
      } else {
        setTestimonials([]);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error fetching testimonials:', err);
      setError(err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (testimonials.length > 1) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [testimonials.length, currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= testimonials.length ? 0 : prevIndex + 1;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const handleScrollToIndexFailed = (info: any) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
  };

  // Helper functions
  const getCustomerName = (testimonial: Testimonial) => {
    if (testimonial.customer_id) {
      const { first_name, last_name } = testimonial.customer_id;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      }
      if (first_name) return first_name;
    }
    return 'Anonymous';
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous') return 'AN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(rating)].map((_, i) => (
          <Ionicons key={i} name="star" size={20} color="#FFD700" />
        ))}
      </View>
    );
  };

  const goToNext = () => {
    if (currentIndex < testimonials.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      startAutoPlay();
    } else {
      setCurrentIndex(0);
      flatListRef.current?.scrollToIndex({
        index: 0,
        animated: true,
      });
      startAutoPlay();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({
        index: prevIndex,
        animated: true,
      });
      startAutoPlay();
    } else {
      const lastIndex = testimonials.length - 1;
      setCurrentIndex(lastIndex);
      flatListRef.current?.scrollToIndex({
        index: lastIndex,
        animated: true,
      });
      startAutoPlay();
    }
  };

  const renderTestimonial = ({ item }: { item: Testimonial }) => {
    const customerName = getCustomerName(item);

    return (
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
          style={styles.card}
        >
          {/* Rating Stars */}
          {renderStars(item.rate)}

          {/* Feedback */}
          <Text style={styles.feedback} numberOfLines={4}>
            "{item.feedback}"
          </Text>

          {/* Customer Info */}
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{getInitials(customerName)}</Text>
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0d3778', '#1a4d99']} style={styles.container}>
        <Text style={styles.title}>What Our Customers Say</Text>
        <Text style={styles.subtitle}>Join thousands of satisfied renters</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0d3778', '#1a4d99']} style={styles.container}>
      <Text style={styles.title}>What Our Customers Say</Text>
      <Text style={styles.subtitle}>Join thousands of satisfied renters</Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ Failed to load reviews</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      ) : testimonials.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No reviews available at the moment.</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.navButton, styles.navButtonLeft]}
                onPress={goToPrev}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, styles.navButtonRight]}
                onPress={goToNext}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* Testimonials Carousel */}
          <FlatList
            ref={flatListRef}
            data={testimonials}
            renderItem={renderTestimonial}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN)
              );
              setCurrentIndex(index);
            }}
            onTouchStart={stopAutoPlay}
            onTouchEnd={startAutoPlay}
          />

          {/* Dot Indicators */}
          {testimonials.length > 1 && (
            <View style={styles.dotsContainer}>
              {testimonials.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCurrentIndex(index);
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                    startAutoPlay();
                  }}
                  style={[
                    styles.dot,
                    currentIndex === index ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingTop: 48,
    paddingBottom: 64,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontSize: 12,
  },
  carouselContainer: {
    position: 'relative',
  },
  flatListContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 280,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  feedback: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
    marginBottom: 20,
    flexGrow: 1,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d3778',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonLeft: {
    left: 8,
  },
  navButtonRight: {
    right: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});