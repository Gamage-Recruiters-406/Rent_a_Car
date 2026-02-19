import React, { useRef, useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
// import { useRoute } from "@react-navigation/native";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState([]);


  const scrollX = useRef(null);
  const CARD_WIDTH = 292;
  const currentIndex = useRef(0);
  const autoScrollRef = useRef(null);
  const isUserInteracting = useRef(false);
  // const route = useRoute();
  // const { vehicleImage, vehicleName } = route.params;


  const loopedReviews =
    reviews.length > 0
      ? [reviews[reviews.length - 1], ...reviews, reviews[0]]
      : [];

    const toggleExpand = (id) => {
    setExpandedReviews(prev =>
        prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
    };
      
    

  // const API_BASE_URL = 
  //   Platform.OS = 'web'?
  //     'http://localhost:8090':  
  //     process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

  const vehicleId = '696f19b58b0b00033e2af308';

  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("API_VERSION:", API_VERSION);

  const loadReviewSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get(
        `${API_BASE_URL}${API_VERSION}/reviews/vehicle/${vehicleId}/rating`,
        { withCredentials: true }
      );
      setAverageRating(res.data.rating || 0);
      setTotalReviews(res.data.totalReviews || 0);

      console.log("Summary:", res.data);
      console.log("Avg.Rating:", res.data.rating);
      console.log("Total Reviews:", res.data.totalReviews);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchReviewsByVehicleId = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(
        `${API_BASE_URL}${API_VERSION}/reviews/vehicle/${vehicleId}`,
        { withCredentials: true }
      );
      console.log("Reviews: ", res.data.reviews);
      setReviews(res.data.reviews || []);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || !feedback.trim()) {
      alert("Please provide a rating and feedback.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axios.post(
        `${API_BASE_URL}${API_VERSION}/reviews/create`,
        {
          vehicle_id: vehicleId,
          rate: rating,
          feedback: feedback,
        },
        { withCredentials: true}
      );

      setRating(0);
      setFeedback("");

      await Promise.all([fetchReviewsByVehicleId(vehicleId), loadReviewSummary(vehicleId), checkCanReview()]);

      //setShowSuccessModal(true);

    } catch (error) {
      console.error("Failed to submit review", error);

      if (error.request && !error.response) {
        alert("Network error. Please try again later.");
      } else {
        alert(error.response?.data?.message || "Failed to submit review");
      }
    }finally {
      setSubmitting(false);
    }
  };

  const checkCanReview = async () => {
    try {
      setCheckingPermission(true);
      const res = await axios.get(
        `${API_BASE_URL}${API_VERSION}/reviews/can-review/${vehicleId}`,
        { withCredentials: true }
      );
      setCanReview(res.data.canReview);
      setReviewReason(res.data.reason || '');
    } catch {
      console.error("Failed to Check Permission", error);

      if (error.request && !error.response) {
        alert("Network error. Please try again later.");
      } else {
        alert(error.response?.data?.message || "Failed to Check Permission");
      }
    } finally {
      setCheckingPermission(false);
    }
  };

  useEffect(() => {
    loadReviewSummary();
    fetchReviewsByVehicleId();
    checkCanReview();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollX.current?.scrollTo({ x: CARD_WIDTH, animated: false });
    }, 50);
  }, []);

  const handleScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / CARD_WIDTH);

    if (index === 0) {
      scrollX.current?.scrollTo({
        x: CARD_WIDTH * reviews.length,
        animated: false,
      });
      currentIndex.current = reviews.length - 1;
    }

    if (index === reviews.length + 1) {
      scrollX.current?.scrollTo({
        x: CARD_WIDTH,
        animated: false,
      });
      currentIndex.current = 0;
    }
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current) return;

    autoScrollRef.current = setInterval(() => {
      if (!scrollX.current || isUserInteracting.current) return;

      currentIndex.current += 1;
      if (currentIndex.current > reviews.length + 1) {
        currentIndex.current = 1;
      }

      scrollX.current.scrollTo({
        x: currentIndex.current * CARD_WIDTH,
        animated: true,
      });
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [reviews.length]);

  const getInitials = (f, l) =>
    `${f?.charAt(0) || ''}${l?.charAt(0) || ''}`.toUpperCase();

  const Stars = ({ value, onPress, size = 36 }) => (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onPress?.(s)}>
          <FontAwesome
            name={s <= value ? 'star' : 'star-o'}
            size={size}
            color="#FFC107"
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="p-4 pb-8">
        <View className="p-6">
            <Text className="text-2xl font-bold text-center text-[#0D3778] mt-2">
            Customer Reviews
            </Text>
            <Text className="text-sm text-center text-[#0D3778] mb-5">
            Share Your Experience With Us
            </Text>

            <View className="border-2 border-[#0D3778] rounded-2xl p-4 bg-white mb-5">
              <Text className="text-center text-base text-gray-600 mb-3">
                  Toyota Prius (ABC-1234)
              </Text>

              <View className="flex-row py-4">
                  <View className="flex-1 items-center">
                    <Text className="text-3xl font-bold text-yellow-500">
                        {loadingSummary ? '...' : averageRating.toFixed(1)}
                    </Text>
                    <Stars value={averageRating} size={22} />
                  </View>

                  <View className="w-[2px] bg-gray-200 mx-3" />

                  <View className="flex-1 items-center">
                    <Text className="text-3xl font-bold text-[#0D3778]">
                        {loadingSummary ? '...' : totalReviews}
                    </Text>
                  <Text className="text-base text-[#0D3778]">Reviews</Text>
                  </View>
              </View>
            </View>

            {checkingPermission ? (
            <Text className="text-center text-gray-500 my-4">
                Checking review permission...
            </Text>
                ) : canReview ? (
                <View>
                    <View className="items-center mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Your Rating
                    </Text>
                    <Stars value={rating} onPress={setRating} />
                    </View>

                    <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Write Feedback
                    </Text>
                    <TextInput
                        className="border-2 border-[#0D3778] rounded-xl p-3 min-h-[90px]"
                        multiline
                        placeholder="Share your experience..."
                        value={feedback}
                        onChangeText={setFeedback}
                    />
                    </View>

                    <View className="flex-row justify-end gap-3 mb-6">
                    <TouchableOpacity
                        className="border border-[#0D3778] rounded-xl px-6 py-2"
                        onPress={() => {
                        setRating(0);
                        setFeedback('');
                        }}
                    >
                        <Text className="text-[#0D3778] font-semibold">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-[#0D3778] rounded-xl px-6 py-2"
                        onPress={handleSubmitReview}
                        disabled={submitting}
                    >
                        <Text className="text-white font-semibold">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
                ) : (
            <View className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-xl items-center mt-4">
                <Text className="text-amber-700 font-semibold text-center">
                {reviewReason || "You've already reviewed this vehicle."}
                </Text>
            </View>
            )}

            <Image
            source={{
                uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
            }}
            className="w-full h-[220px] rounded-xl mt-2 mb-3"
            />

            <ImageBackground
                source={{
                    uri: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
                }}
                className="mt-6 rounded-2xl overflow-hidden"
                >
                <View className="bg-black/60 py-8 px-4">
                    <Text className="text-white text-center text-xl font-bold mb-1">
                        Clients Reviews
                    </Text>
                    <Text className="text-gray-300 text-center text-xs leading-5 mb-3">
                        How our cherished clients express experiences and feedback from
                        customers through RentMyCar with us
                    </Text>

                    <ScrollView
                        ref={scrollX}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH}
                        decelerationRate="fast"
                        snapToAlignment="center"
                        onScroll={handleScrollEnd}
                        scrollEventThrottle={16}
                        onTouchStart={() => {
                            isUserInteracting.current = true;
                            stopAutoScroll();
                        }}
                        onTouchEnd={() => {
                            isUserInteracting.current = false;
                            startAutoScroll();
                        }}
                    >
                    {loopedReviews.map((review, index) => (
                        <View
                            key={`${review._id}-${index}`}
                            className="bg-white rounded-2xl border-b-4 border-[#0D3778] w-[280px] m-2 shadow-lg overflow-hidden"
                        >
                            <View className="bg-slate-100 rounded-t-2xl border-b-2 border-[#0D3778] flex-row p-3 gap-3">
                                {review.customer_id?.avatar ? (
                                    <Image
                                        source={{ uri: review.customer_id.avatar }}
                                        className="w-[54px] h-[54px] rounded-full"
                                    />
                                    ) : (
                                        <View className="w-[54px] h-[54px] rounded-full bg-[#0D3778] items-center justify-center">
                                            <Text className="text-white font-bold text-lg">
                                                {getInitials(
                                                    review.customer_id.first_name,
                                                    review.customer_id.last_name
                                                )}
                                            </Text>
                                        </View>
                                    )}

                                <View className="flex-1">
                                    <Text className="text-base font-bold text-[#0D3778]">
                                        {review.customer_id.first_name}{' '}
                                        {review.customer_id.last_name}
                                    </Text>
                                    <Stars value={review.rate} size={18} />
                                </View>
                            </View>

                            <Text className="p-4 text-sm text-gray-600 leading-5">
                                "{expandedReviews.includes(review._id)
                                    ? review.feedback
                                    : review.feedback?.length > 150
                                    ? review.feedback?.slice(0, 150) + '...'
                                    : review.feedback
                                }"

                                {review.feedback.length > 150 && (
                                    <Text
                                    className="text-[#0D3778] font-bold"
                                    onPress={() => toggleExpand(review._id)}
                                    >
                                    {expandedReviews.includes(review._id) ? ' Show Less' : ' Read More'}
                                    </Text>
                                )}
                            </Text>
                        </View>
                    ))}
                    </ScrollView>
                </View>
            </ImageBackground>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
