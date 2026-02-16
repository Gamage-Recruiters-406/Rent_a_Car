// client/components/ui/Items.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_MARGIN = 16;

interface VehicleData {
  vehicle: {
    _id: string;
    title: string;
    photos: Array<{ url: string }>;
    seats: number;
    transmission: string;
    pricePerDay: number;
  };
  bookingCount: number;
}

export const Items = () => {
  const [cars, setCars] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (cars.length > 1) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [cars.length, currentIndex]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/v1/vehicle/top-booked');

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();

      if (data.success && data.vehicles) {
        setCars(data.vehicles);
      } else {
        setCars([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= cars.length ? 0 : prevIndex + 1;
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

  const goToNext = () => {
    if (currentIndex < cars.length - 1) {
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
      const lastIndex = cars.length - 1;
      setCurrentIndex(lastIndex);
      flatListRef.current?.scrollToIndex({
        index: lastIndex,
        animated: true,
      });
      startAutoPlay();
    }
  };

  const renderCarCard = ({ item, index }: { item: VehicleData; index: number }) => {
    const car = item?.vehicle || {};
    const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0].url : '';

    if (!firstPhoto) {
      return null;
    }

    const imageUrl = `http://localhost:8090${firstPhoto}`;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => console.log('View details:', car.title)}
        >
          {/* Vehicle Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text style={styles.carTitle} numberOfLines={2}>
              {car.title || 'Untitled Vehicle'}
            </Text>

            {/* Features */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{car.seats || 0} Seats</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="car-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{car.transmission || 'N/A'}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="star" size={16} color="#eab308" />
                <Text style={styles.bookingText}>{item.bookingCount || 0}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Price and Button */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                LKR {(car.pricePerDay || 0).toLocaleString()}
                <Text style={styles.perDay}>/day</Text>
              </Text>

              <TouchableOpacity style={styles.button} activeOpacity={0.8}>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Popular Cars</Text>
          <Text style={styles.subtitle}>Most booked vehicles on our platform</Text>
        </View>
        <View style={styles.centerContainer}>
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
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCars}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
        <View style={styles.centerContainer}>
          <Ionicons name="car-sport" size={64} color="#9ca3af" />
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

      {/* Carousel Container */}
      <View style={styles.carouselContainer}>
        {/* Navigation Buttons */}
        {cars.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={goToPrev}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#0d3778" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={goToNext}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#0d3778" />
            </TouchableOpacity>
          </>
        )}

        {/* Cars Carousel */}
        <FlatList
          ref={flatListRef}
          data={cars}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.vehicle._id}
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
        {cars.length > 1 && (
          <View style={styles.dotsContainer}>
            {cars.map((_, index) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 48,
  },
  centerContainer: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0d3778',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d3778',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 300,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 20,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookingText: {
    fontSize: 14,
    color: '#eab308',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d3778',
    marginBottom: 16,
    textAlign: 'center',
  },
  perDay: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  button: {
    width: '100%',
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    position: 'absolute',
    top: '45%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    backgroundColor: '#0d3778',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#d1d5db',
  },
});