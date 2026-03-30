import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { Stack } from 'expo-router';
import AppLayout from '../components/layout/Layout';

const stars = [1, 2, 3, 4, 5];

export default function MyReviewsMobile() {
  const [reviews, setReviews] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editFeedback, setEditFeedback] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedReviews, setExpandedReviews] = useState([]);

  // const API_BASE_URL = 
  //   Platform.OS = 'web'?
  //     'http://localhost:8090':  
  //     process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

  const IMAGE_BASE_URL = API_BASE_URL || '';

  const fetchMyReviews = useCallback(async ()=>{
      setLoading(true);
    try {
        const res = await axios.get(`${API_BASE_URL}${API_VERSION}/reviews/me`,
        {withCredentials:true}
        );
        console.log("Fetched Reviews: ",res);
        setReviews(res.data.reviews);
    } catch (error) {
        console.error("Faile to fetch reviews", error);

        if (error.request && !error.response) {
            alert("Network error. Please try again later.");
          } else {
            alert(
              error.response?.data?.message || "Failed to fetch reviews"
            );
          }

    } finally {
        setLoading(false);
    }
  }, [API_BASE_URL, API_VERSION]);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  const handleEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rate);
    setEditFeedback(review.feedback);
    setShowMenu(null);
  };

  const handleUpdate = async (reviewId) => {
    try {
        const res = await axios.put(
            `${API_BASE_URL}${API_VERSION}/reviews/update/${reviewId}`,
            {
                rate: editRating,
                feedback: editFeedback,
            },
            {withCredentials:true}
        );
        console.log('Update response:', res.data);

        // Re-fetch latest reviews
        await fetchMyReviews();

        // alert('Review updated successfully');


        
        setEditingId(null);
        setEditRating(0);
        setEditFeedback('');
    } catch (error) {
        console.error('Failed to update review', error);
       if (error.request && !error.response) {
            alert("Network error. Please try again later.");
        } else {
            alert(
            error.response?.data?.message || "Failed to update review"
            );
        }

    }  
  };

  const handleDelete = async () => {

    try {
        await axios.delete(
            `${API_BASE_URL}${API_VERSION}/reviews/delete/${deleteTargetId}`,
            {withCredentials:true}
        );

        await fetchMyReviews();
        // alert('Review deleted successfully');

        setDeleteTargetId(null); // colse modal
    } catch (error) {
        console.error('Failed to delete review', error);
        if (error.request && !error.response) {
            alert("Network error. Please try again later.");
          } else {
            alert(
              error.response?.data?.message || "Failed to delete review"
            );
          }

    }
  };

  const toggleExpand = (id) => {
    setExpandedReviews(prev =>
        prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
    };

  const renderReview = ({ item: review }) => {
    const isEditing = editingId === review._id;

    return (
      <View className="bg-white rounded-xl p-4 mb-4 border-2 border-[#0D3778] relative">

        {loading && (
            <p className="text-center text-gray-500">Loading reviews...</p>
        )}
        {/* Top Row: Image + Title + Menu */}
        <View className="flex-row items-start">
          <View className="w-20 h-20 bg-blue-100 rounded-lg overflow-hidden">
            {review.vehicle_id?.photos?.length > 0 ? (
              <Image
                source={{ uri: IMAGE_BASE_URL + review.vehicle_id.photos[0].url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center px-1">
                <Text className="text-[#0D3778] text-xs font-semibold text-center">
                  {review.vehicle_id?.model || 'No Image'}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text numberOfLines={1} className="font-semibold text-lg text-gray-800 flex-1 pr-2">
                {review.vehicle_id?.title}
              </Text>

              {/* Dropdown Menu */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setShowMenu(showMenu === review._id ? null : review._id)}
                  className="p-2" // increase touch area
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // extra sensitive area
                >
                  <FontAwesome name="ellipsis-v" size={18} color="#0D3778" />
                </TouchableOpacity>

                {showMenu === review._id && (
                    <TouchableOpacity
                    onPress={() => setShowMenu(null)}
                    activeOpacity={1}
                    className="absolute inset-0 z-40"
                  >
                  <View className="absolute right-0 top-6 bg-white border-2 border-[#0D3778] rounded-lg w-32 z-50">
                    {!isEditing ? (
                      <TouchableOpacity
                        onPress={() => handleEdit(review)}
                        className="py-2 px-2 border-b border-[#0D3778]"
                      >
                        <Text className="text-center text-[#0D3778] font-medium">Edit</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          onPress={() => handleUpdate(review._id)}
                          className="py-2 border-b border-[#0D3778]"
                        >
                          <Text className="text-center text-green-600">Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setEditingId(null)}
                          className="py-2 border-b border-[#0D3778]"
                        >
                          <Text className="text-center text-gray-700">Cancel</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setDeleteTargetId(review._id);
                        setShowMenu(null);
                      }}
                      className="py-2"
                    >
                      <Text className="text-center text-red-600">Delete</Text>
                    </TouchableOpacity>
                  </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>

        {/* Rating + Feedback */}
        {isEditing ? (
          <View className="mt-4">
            <View className="flex-row mb-3">
              {stars.map((star) => (
                <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
                  <FontAwesome
                    name={star <= editRating ? 'star' : 'star-o'}
                    size={30}
                    color="#FACC15"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={editFeedback}
              onChangeText={setEditFeedback}
              multiline
              placeholder="Edit your feedback"
              className="border border-gray-300 rounded-lg p-3 text-gray-800"
            />
            <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                    onPress={() => handleUpdate(review._id)}
                    className="flex-1 bg-[#0D3778] py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-semibold">Update</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setEditingId(null)}
                    className="flex-1 border-2 border-[#0D3778] py-3 rounded-lg"
                >
                    <Text className="text-[#0D3778] text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                </View>
          </View>
        ) : (
          <View className="mt-3">
            <View className="flex-row">
              {stars.map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= review.rate ? 'star' : 'star-o'}
                  size={26}
                  color="#FACC15"
                />
              ))}
            </View>
            <Text className="text-gray-700 mt-2">
                {expandedReviews.includes(review._id)
                    ? review.feedback
                    : review.feedback?.length > 150
                    ? review.feedback?.slice(0, 150) + '...'
                    : review.feedback
                }

                {review.feedback.length > 150 && (
                    <Text
                    className="text-[#0D3778] font-bold"
                    onPress={() => toggleExpand(review._id)}
                    >
                    {expandedReviews.includes(review._id) ? ' Show Less' : ' Read More'}
                    </Text>
                )}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white">
        <AppLayout>
          <FlatList
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            data={reviews}
            keyExtractor={(item) => item._id}
            renderItem={renderReview}
          />
        </AppLayout>
      </SafeAreaView>

      {/* Delete Confirmation Modal */}
      <Modal visible={!!deleteTargetId} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-xl p-6 w-full">
            <View className="items-center mb-3">
              <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center">
                <FontAwesome name="trash" size={22} color="#DC2626" />
              </View>
              <Text className="font-semibold text-lg mt-2">Delete Review</Text>
            </View>
            <Text className="text-center text-gray-600 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDeleteTargetId(null)}
                className="flex-1 border-2 border-[#0D3778] py-3 rounded-lg"
              >
                <Text className="text-center text-[#0D3778] font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="flex-1 bg-red-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}