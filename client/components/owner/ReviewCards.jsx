// components/owner/ReviewCards.jsx
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL    = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION || '/api/v1';

function StarRow({ rating }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(rating) ? 'star' : 'star-outline'}
          size={13}
          color={i < Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }) {
  const name    = review.user?.name || review.userName || 'Anonymous';
  const initial = name.charAt(0).toUpperCase();
  const date    = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {/* Avatar */}
        <View style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: '#0D3778',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 10,
        }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: '#1F2937', fontSize: 14 }}>{name}</Text>
          <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{date}</Text>
        </View>

        <StarRow rating={review.rating ?? 0} />
      </View>

      {review.comment ? (
        <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>
          {review.comment}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * ReviewCards
 * Props:
 *   vehicleId {string} — fetches reviews for this vehicle
 */
export default function ReviewCards({ vehicleId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchReviews = async () => {
      try {
        const res  = await fetch(`${BASE_URL}${API_VERSION}/reviews/vehicle/${vehicleId}`);
        const data = await res.json();
        setReviews(data?.reviews || data?.data || []);
      } catch (e) {
        console.error('ReviewCards fetch error:', e);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [vehicleId]);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <ActivityIndicator size="small" color="#0D3778" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={{
        alignItems: 'center',
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
      }}>
        <Ionicons name="chatbubble-outline" size={32} color="#D1D5DB" />
        <Text style={{ color: '#9CA3AF', marginTop: 8, fontSize: 14 }}>No reviews yet</Text>
      </View>
    );
  }

  // Average rating
  const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  return (
    <View>
      {/* Section header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0D3778' }}>
          Reviews
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <StarRow rating={avg} />
          <Text style={{ fontSize: 13, color: '#6B7280' }}>
            {avg.toFixed(1)} ({reviews.length})
          </Text>
        </View>
      </View>

      {reviews.map((review, i) => (
        <ReviewCard key={review._id || i} review={review} />
      ))}
    </View>
  );
}