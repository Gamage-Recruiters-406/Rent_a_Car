import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length > 1) startAutoPlay();
    return () => stopAutoPlay();
  }, [testimonials.length, currentIndex]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_VERSION}/reviews/home`);
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const data = await response.json();
      setTestimonials(data.success && Array.isArray(data.reviews) ? data.reviews : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1 >= testimonials.length ? 0 : prev + 1;
        scrollToIndex(next);
        return next;
      });
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * (CARD_WIDTH + 16), animated: true });
  };

  const goToNext = () => {
    const next = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(next);
    scrollToIndex(next);
    startAutoPlay();
  };

  const goToPrev = () => {
    const prev = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
    setCurrentIndex(prev);
    scrollToIndex(prev);
    startAutoPlay();
  };

  const getCustomerName = (t) => {
    if (t.customer_id) {
      const { first_name, last_name } = t.customer_id;
      if (first_name && last_name) return `${first_name} ${last_name}`;
      if (first_name) return first_name;
    }
    return 'Anonymous';
  };

  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return 'AN';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderStars = (rating) => (
    <View style={styles.starsRow}>
      {[...Array(rating)].map((_, i) => (
        <Text key={i} style={styles.star}>⭐</Text>
      ))}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#0d3778', '#1a4d99']} style={styles.container}>
        <Text style={styles.title}>What Our Customers Say</Text>
        <Text style={styles.subtitle}>Join thousands of satisfied renters</Text>
        <View style={styles.centered}>
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>⚠️ Failed to load reviews</Text>
          <Text style={styles.errorSubText}>{error}</Text>
        </View>
      ) : testimonials.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No reviews available at the moment.</Text>
        </View>
      ) : (
        <View style={styles.carouselWrapper}>
          {/* Prev Button */}
          {testimonials.length > 1 && (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnLeft]} onPress={goToPrev}>
              <Text style={styles.navBtnText}>‹</Text>
            </TouchableOpacity>
          )}

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContent}
            onScrollBeginDrag={stopAutoPlay}
            onScrollEndDrag={startAutoPlay}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
              setCurrentIndex(idx);
            }}
          >
            {testimonials.map((item) => {
              const customerName = getCustomerName(item);
              return (
                <View key={item._id} style={styles.card}>
                  {renderStars(item.rate)}
                  <Text style={styles.feedback} numberOfLines={4}>
                    "{item.feedback}"
                  </Text>

                  {/* Customer Info */}
                  <View style={styles.customerRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(customerName)}</Text>
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{customerName}</Text>
                      <Text style={styles.customerDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Next Button */}
          {testimonials.length > 1 && (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={goToNext}>
              <Text style={styles.navBtnText}>›</Text>
            </TouchableOpacity>
          )}

          {/* Dot Indicators */}
          {testimonials.length > 1 && (
            <View style={styles.dotsRow}>
              {testimonials.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCurrentIndex(index);
                    scrollToIndex(index);
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
  container: { paddingTop: 48, paddingBottom: 64 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8, paddingHorizontal: 16 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  centered: { minHeight: 200, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  errorSubText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  carouselWrapper: { position: 'relative' },
  scrollContent: { paddingHorizontal: width * 0.075, gap: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 24,
    minHeight: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 16 },
  star: { fontSize: 18 },
  feedback: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
    marginBottom: 20,
    flex: 1,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#0d3778' },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  customerDate: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  navBtn: {
    position: 'absolute',
    top: '45%',
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navBtnLeft: { left: 8 },
  navBtnRight: { right: 8 },
  navBtnText: { fontSize: 24, color: '#fff', lineHeight: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: '#fff' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
});