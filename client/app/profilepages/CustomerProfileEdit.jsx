import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

const defaultRecentActivity = [
  { title: 'Rented a Tesla Model 3', timestamp: '2 hours ago' },
  { title: 'Updated profile picture', timestamp: '1 day ago' },
  { title: 'Left a review for BMW X5', timestamp: '3 days ago' },
];

export default function CustomerProfileEdit({
  profile,
  recentActivity = defaultRecentActivity,
  onSave,
  onProfileChange,
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [activeProfile, setActiveProfile] = useState({});
  const [editedProfile, setEditedProfile] = useState(profile);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Read keys that SignInPage actually saves
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (token && userId) {
          const headers = { Authorization: `Bearer ${token}` };

          const response = await axios.get(
            `${baseUrl}${apiVersion}/authUser/getUserDetails`,
            { headers }
          );
          const response2 = await axios.get(
            `${baseUrl}${apiVersion}/bookings/customer/${userId}`,
            { headers }
          );

          if (response.data) {
            const userData = response.data.user || response.data;
            const mappedProfile = {
              ...userData,
              contactNumber: userData.contactNumber || '',
              name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
              createdAt: userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'N/A',
            };
            setActiveProfile(mappedProfile);
            setEditedProfile(mappedProfile);
          }

          if (response2.data) {
            setCustomerBookings(response2.data.data);
          }
        } else {
          console.warn('No token or userId found in storage. User may not be logged in.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeProfile.profilePicture) {
      setImagePreview(`${baseUrl}/${activeProfile.profilePicture}`);
    }
  }, [activeProfile.profilePicture]);

  const handleImageChange = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow media access to choose a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setImagePreview(asset.uri);
      setImageFile(asset);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(activeProfile);
    setErrors({});
  };

  const validate = () => {
    let newErrors = {};

    if (!editedProfile.first_name || !editedProfile.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (!/^[A-Za-z\s]+$/.test(editedProfile.first_name)) {
      newErrors.first_name = 'First name must contain only letters';
    }

    if (!editedProfile.last_name || !editedProfile.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (!/^[A-Za-z\s]+$/.test(editedProfile.last_name)) {
      newErrors.last_name = 'Last name must contain only letters';
    }

    if (!editedProfile.contactNumber) {
      newErrors.contactNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(String(editedProfile.contactNumber).trim())) {
      newErrors.contactNumber = 'Phone number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      // Only append primitive (string/number/boolean) values to avoid sending nested objects
      Object.keys(editedProfile).forEach((key) => {
        const value = editedProfile[key];
        if (value !== null && value !== undefined && typeof value !== 'object') {
          formData.append(key, String(value));
        }
      });
      if (imageFile) {
        formData.append('profilePicture', {
          uri: imageFile.uri,
          type: imageFile.mimeType || 'image/jpeg',
          name: imageFile.fileName || 'profile.jpg',
        });
      }

      const response = await axios.put(
        `${baseUrl}${apiVersion}/authUser/updateUser/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        const updatedProfile = { ...editedProfile };
        if (response.data.user?.profilePicture) {
          updatedProfile.profilePicture = response.data.user.profilePicture;
          setImagePreview(`${baseUrl}/${response.data.user.profilePicture}`);
        }
        setActiveProfile(updatedProfile);
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
        setImageFile(null);
        onSave?.(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(activeProfile);
    setIsEditing(false);
    setImageFile(null);
    setErrors({});
    setImagePreview(
      activeProfile.profilePicture ? `${baseUrl}/${activeProfile.profilePicture}` : null
    );
  };

  const handleFieldChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
    onProfileChange?.(field, value);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await axios.delete(
                `${baseUrl}${apiVersion}/authUser/deleteAccount`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (response.data?.success) {
                await AsyncStorage.multiRemove(['user', 'userToken', 'userId', 'userRole', 'userStatus']);
                Alert.alert('Success', 'Account deleted successfully', [
                  { text: 'OK', onPress: () => router.replace('/login/SignInPage') },
                ]);
              } else {
                Alert.alert('Error', response.data?.message || 'Failed to delete account');
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'An error occurred');
            }
          },
        },
      ]
    );
  };

  const initials = activeProfile.name
    ? activeProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'A';

  const currentProfile = isEditing ? editedProfile : activeProfile;

  const allBookings = customerBookings.length;
  const pendingBookings = customerBookings.filter((b) => b.status === 'pending').length;
  const cancelledBookings = customerBookings.filter((b) => b.status === 'cancelled').length;
  const totalSpends = customerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View className="bg-[#0A2E5C] px-4 pt-6 pb-5">

        {/* Avatar + Name row */}
        <View className="flex-row items-center mb-4">
          <View className="relative mr-3">
            <View className="w-16 h-16 rounded-full bg-white overflow-hidden items-center justify-center">
              {imagePreview || currentProfile.avatar ? (
                <Image
                  source={{ uri: imagePreview || currentProfile.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-[#0A2E5C] text-2xl font-bold">{initials}</Text>
              )}
            </View>
            {isEditing && (
              <TouchableOpacity
                onPress={handleImageChange}
                className="absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 items-center justify-center shadow"
              >
                <Text className="text-xs">📷</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-white text-xl font-semibold capitalize">
              {currentProfile.first_name} {currentProfile.last_name}
            </Text>
            <Text className="text-white/80 text-sm mt-0.5">customer</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          {isEditing && (
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-white/10 rounded-lg py-2.5 items-center"
            >
              <Text className="text-white font-semibold text-sm">✕  Cancel</Text>
            </TouchableOpacity>
          )}
          {isEditing && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className="flex-1 bg-white rounded-lg py-2.5 items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="#0A2E5C" size="small" />
              ) : (
                <Text className="text-[#0A2E5C] font-semibold text-sm">💾  Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="flex-1 bg-red-500/10 rounded-lg py-2.5 items-center"
            >
              <Text className="text-red-400 font-semibold text-sm">🗑  Delete</Text>
            </TouchableOpacity>
          )}
          {!isEditing && (
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 bg-white rounded-lg py-2.5 items-center"
            >
              <Text className="text-[#0A2E5C] font-semibold text-sm">✏️  Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Content ── */}
      <View className="p-4 gap-4">

        {/* Personal Information Card */}
        <View className={`bg-white rounded-xl p-4 shadow-sm ${isEditing ? 'border-2 border-[#0A2E5C]/20' : ''}`}>
          <Text className="text-[#0A2E5C] font-bold text-base mb-4">Personal Information</Text>

          {/* First Name */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">👤</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">First Name</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.first_name || ''}
                onChangeText={(v) => handleFieldChange('first_name', v)}
                editable={isEditing}
              />
              {errors.first_name && <Text className="text-red-500 text-xs mt-1">{errors.first_name}</Text>}
            </View>
          </View>

          {/* Last Name */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">👤</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Last Name</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.last_name || ''}
                onChangeText={(v) => handleFieldChange('last_name', v)}
                editable={isEditing}
              />
              {errors.last_name && <Text className="text-red-500 text-xs mt-1">{errors.last_name}</Text>}
            </View>
          </View>

          {/* Email */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">✉️</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Email</Text>
              <TextInput
                className="text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md"
                value={currentProfile.email || ''}
                editable={false}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Phone */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">📞</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Phone Number</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.contactNumber ? String(currentProfile.contactNumber) : ''}
                onChangeText={(v) => handleFieldChange('contactNumber', v)}
                editable={isEditing}
                keyboardType="phone-pad"
              />
              {errors.contactNumber && <Text className="text-red-500 text-xs mt-1">{errors.contactNumber}</Text>}
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">📍</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Location</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.location || ''}
                onChangeText={(v) => handleFieldChange('location', v)}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Member Since */}
          <View className="flex-row items-start">
            <Text className="text-base w-6 text-center mt-1 mr-3">📅</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Member Since</Text>
              <Text className="text-[#0A2E5C] font-medium text-sm px-2 py-1">
                {currentProfile.createdAt || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Bio Card */}
        <View className={`bg-white rounded-xl p-4 shadow-sm ${isEditing ? 'border-2 border-[#0A2E5C]/20' : ''}`}>
          <Text className="text-[#0A2E5C] font-bold text-base mb-3">Bio</Text>
          <TextInput
            className={`text-[#999fa8] text-sm leading-5 px-2 py-1 rounded-md min-h-[80px] ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
            value={currentProfile.bio || ''}
            onChangeText={(v) => handleFieldChange('bio', v)}
            editable={isEditing}
            multiline
            numberOfLines={4}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#999fa8"
            textAlignVertical="top"
          />
        </View>

        {/* Account Stats Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-[#0A2E5C] font-bold text-base mb-4">Account Stats</Text>
          <View className="flex-row flex-wrap gap-3">

            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">All Bookings</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{allBookings}</Text>
            </View>

            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Pending</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{pendingBookings}</Text>
            </View>

            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Cancelled</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{cancelledBookings}</Text>
            </View>

            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Total Spends</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">RS.{totalSpends}</Text>
            </View>

          </View>
        </View>

        {/* Recent Activity Card */}
        <View className="bg-[#0A2E5C] rounded-xl p-4 mb-8 shadow-sm">
          <Text className="text-white font-bold text-base mb-4">Recent Activity</Text>
          {recentActivity.map((activity, index) => (
            <View
              key={index}
              className={`pb-3 mb-3 ${index < recentActivity.length - 1 ? 'border-b border-white/20' : ''}`}
            >
              <Text className="text-white font-medium text-sm mb-0.5">{activity.title}</Text>
              <Text className="text-white/60 text-xs">{activity.timestamp}</Text>
            </View>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}
