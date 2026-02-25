import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
 const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;


export const Items = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (cars.length > 1) startAutoPlay();
    return () => stopAutoPlay();
  }, [cars.length, currentIndex]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_VERSION}/vehicle/top-booked`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setCars(data.success && data.vehicles ? data.vehicles : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1 >= cars.length ? 0 : prev + 1;
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
    scrollRef.current?.scrollTo({
      x: index * (CARD_WIDTH + 16),
      animated: true,
    });
  };

  const goToNext = () => {
    const next = currentIndex < cars.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(next);
    scrollToIndex(next);
    startAutoPlay();
  };

  const goToPrev = () => {
    const prev = currentIndex > 0 ? currentIndex - 1 : cars.length - 1;
    setCurrentIndex(prev);
    scrollToIndex(prev);
    startAutoPlay();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Cars</Text>
          <Text style={styles.subtitle}>Most booked vehicles on our platform</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0d3778" />
          <Text style={styles.loadingText}>Loading popular cars...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Cars</Text>
          <Text style={styles.subtitle}>Most booked vehicles on our platform</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCars}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Cars</Text>
          <Text style={styles.subtitle}>Most booked vehicles on our platform</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No popular cars available at the moment.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Popular Cars</Text>
        <Text style={styles.subtitle}>Most booked vehicles on our platform</Text>
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        {/* Prev Button */}
        {cars.length > 1 && (
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
          {cars.map((item) => {
            const car = item?.vehicle || {};
            const firstPhoto = car.photos?.[0]?.url;
            if (!firstPhoto) return null;
            const imageUrl = `${BASE_URL}${firstPhoto}`;

            return (
              <TouchableOpacity
                key={car._id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => console.log('View details:', car.title)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {car.title || 'Untitled Vehicle'}
                  </Text>

                  {/* Features Row */}
                  <View style={styles.featuresRow}>
                    <Text style={styles.featureText}>👥 {car.seats || 0} Seats</Text>
                    <Text style={styles.featureText}>⚙️ {car.transmission || 'N/A'}</Text>
                    <Text style={styles.featureTextYellow}>⭐ {item.bookingCount || 0}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Price & Button */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      LKR {(car.pricePerDay || 0).toLocaleString()}
                      <Text style={styles.perDay}>/day</Text>
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Next Button */}
        {cars.length > 1 && (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={goToNext}>
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dot Indicators */}
      {cars.length > 1 && (
        <View style={styles.dotsRow}>
          {cars.map((_, index) => (
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
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0d3778', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 260 },
  centered: { minHeight: 300, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  retryBtn: { backgroundColor: '#0d3778', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  carouselWrapper: { position: 'relative' },
  scrollContent: { paddingHorizontal: width * 0.075, gap: 16 },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: { width: '100%', height: 208 },
  cardContent: { padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12, textAlign: 'center' },
  featuresRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  featureText: { fontSize: 13, color: '#6b7280' },
  featureTextYellow: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  priceRow: { alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#0d3778' },
  perDay: { fontSize: 13, color: '#6b7280', fontWeight: 'normal' },
  detailsBtn: { backgroundColor: '#1e3a8a', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  detailsBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  navBtn: {
    position: 'absolute',
    top: '45%',
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  navBtnLeft: { left: 8 },
  navBtnRight: { right: 8 },
  navBtnText: { fontSize: 24, color: '#0d3778', lineHeight: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 32, backgroundColor: '#0d3778' },
  dotInactive: { width: 8, backgroundColor: '#d1d5db' },
});