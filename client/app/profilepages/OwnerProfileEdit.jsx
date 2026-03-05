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

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

const defaultProfile = {
  name: '',
  subtitle: 'Owner',
  avatar: 'https://avatar.iran.liara.run/public/boy?username=',
  phone: '',
  contactNumber: '',
  location: '',
  first_name: '',
  last_name: '',
  createdAt: new Date().toISOString(),
  bio: '',
};

export default function OwnerProfileEdit({
  profile = defaultProfile,
  onSave,
  onProfileChange,
}) {
  const [activeProfile, setActiveProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [earningansRevenue, setEarningansRevenue] = useState({});
  const [bookings, setBookings] = useState(0);
  const [vehiclecount, setVehiclecount] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (token && userId) {
          const headers = { Authorization: `Bearer ${token}` };

          const response  = await axios.get(`${baseUrl}${apiVersion}/authUser/getUserDetails`, { headers });
          const response2 = await axios.get(`${baseUrl}${apiVersion}/bookings/owner/earnings/${userId}`, { headers });
          const response3 = await axios.get(`${baseUrl}${apiVersion}/bookings/owner/`, { headers });
          const response4 = await axios.get(`${baseUrl}${apiVersion}/vehicle/get-my-all`, { headers });

          if (response.data) {
            const userData = response.data.user || response.data;
            const mappedProfile = {
              ...activeProfile,
              ...userData,
              phone: userData.contactNumber || activeProfile.phone || defaultProfile.phone,
              subtitle:
                userData.role === 2 ? 'Owner' : userData.role === 1 ? 'User' : 'Admin',
              name:
                userData.name ||
                `${userData.first_name || ''} ${userData.last_name || ''}`.trim() ||
                activeProfile.name ||
                defaultProfile.name,
              createdAt: userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'N/A',
            };
            setActiveProfile(mappedProfile);
            setEditedProfile(mappedProfile);

            if (response2.data) setEarningansRevenue(response2.data.data);
            if (response3.data) setBookings(response3.data.data.length);
            if (response4.data) {
              const vehicleData = response4.data;
              const pendingcount = vehicleData.vehicles.filter((v) => v.status === 'Pending').length;
              setVehiclecount(pendingcount);
              console.log(vehicleData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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

  const initials = activeProfile.name
    ? activeProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '';

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(activeProfile);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      Object.keys(editedProfile).forEach((key) => {
        formData.append(key, editedProfile[key]);
      });
      if (imageFile) {
        formData.append('profilePicture', {
          uri: imageFile.uri,
          type: imageFile.mimeType || 'image/jpeg',
          name: imageFile.fileName || 'profile.jpg',
        });
      }

      const response = await axios.put(
        `${baseUrl}${apiVersion}/authUser/Updateuser`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        Alert.alert('Success', response.data.message || 'Profile updated successfully');
        const updatedProfile = { ...editedProfile };
        if (response.data.user?.profilePicture) {
          updatedProfile.profilePicture = response.data.user.profilePicture;
          setImagePreview(`${baseUrl}/${response.data.user.profilePicture}`);
        }
        setActiveProfile(updatedProfile);
        onSave?.(updatedProfile);
        setIsEditing(false);
        setImageFile(null);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(activeProfile);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(
      activeProfile.profilePicture ? `${baseUrl}/${activeProfile.profilePicture}` : null
    );
  };

  const handleFieldChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
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
                Alert.alert('Success', 'Account deleted successfully');
                await AsyncStorage.multiRemove(['user', 'userToken', 'userId', 'userRole', 'userStatus']);
              } else {
                Alert.alert('Error', response.data?.message || 'Failed to delete account');
              }
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'An error occurred while deleting account');
            }
          },
        },
      ]
    );
  };

  const handleVerify = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.patch(
        `${baseUrl}${apiVersion}/authUser/getVerificationMail`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        Alert.alert('Success', response.data.message || 'Verification email sent. Please check your inbox.');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to send verification email.');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'An error occurred while sending verification email.');
    }
  };

  const currentProfile = isEditing ? editedProfile : activeProfile;

  return (
    <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View className="bg-[#0A2E5C] px-4 pt-6 pb-5">

        {/* Avatar + Name */}
        <View className="flex-row items-center mb-4">
          <View className="relative mr-3">
            <View className="w-16 h-16 rounded-full bg-white overflow-hidden items-center justify-center">
              {imagePreview ? (
                <Image source={{ uri: imagePreview }} className="w-full h-full" resizeMode="cover" />
              ) : activeProfile.avatar ? (
                <Image source={{ uri: activeProfile.avatar }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Text className="text-[#0A2E5C] font-semibold text-xl">{initials}</Text>
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
            <Text className="text-white text-xl font-semibold">{activeProfile.name}</Text>
            <Text className="text-white/80 text-sm mt-0.5">{activeProfile.subtitle}</Text>
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
      <View className="p-4">

        {/* Personal Information + Bio Card */}
        <View className={`bg-white rounded-xl p-4 shadow-sm mb-4 ${isEditing ? 'border-2 border-[#0A2E5C]/20' : ''}`}>
          <Text className="text-[#0A2E5C] font-bold text-base mb-4">Personal Information</Text>

          {/* First Name */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">👤</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">first name</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.first_name || ''}
                onChangeText={(v) => handleFieldChange('first_name', v)}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Last Name */}
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">👤</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">last name</Text>
              <TextInput
                className={`text-[#0A2E5C] font-medium text-sm px-2 py-1 rounded-md ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
                value={currentProfile.last_name || ''}
                onChangeText={(v) => handleFieldChange('last_name', v)}
                editable={isEditing}
              />
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
                keyboardType="numeric"
              />
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
          <View className="flex-row items-start mb-4">
            <Text className="text-base w-6 text-center mt-1 mr-3">📅</Text>
            <View className="flex-1">
              <Text className="text-[#999fa8] text-xs mb-1">Member Since</Text>
              <Text className="text-[#0A2E5C] font-medium text-sm px-2 py-1">
                {activeProfile.createdAt}
              </Text>
            </View>
          </View>

          {/* Bio */}
          <View className="border-t border-gray-100 pt-4 mt-1">
            <Text className="text-[#0A2E5C] font-semibold text-sm mb-2">Bio</Text>
            <TextInput
              className={`text-[#999fa8] text-sm leading-5 px-2 py-1 rounded-md min-h-[70px] ${isEditing ? 'bg-gray-50 border border-[#0A2E5C]/15' : ''}`}
              value={currentProfile.bio || ''}
              onChangeText={(v) => handleFieldChange('bio', v)}
              editable={isEditing}
              multiline
              numberOfLines={3}
              placeholder="Tell us about your business..."
              placeholderTextColor="#999fa8"
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Account Stats Card */}
        <View className="bg-white rounded-xl p-4 shadow-sm mb-8">
          <Text className="text-[#0A2E5C] font-bold text-base mb-4">Account Stats</Text>

          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Pending Vehicles</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{vehiclecount}</Text>
            </View>
            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Total Bookings</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{bookings}</Text>
            </View>
            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Total Earnings</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">RS.{earningansRevenue.totalEarnings || 0}</Text>
            </View>
            <View className="bg-gray-100 rounded-xl p-3" style={{ width: '47%' }}>
              <Text className="text-[#999fa8] text-xs mb-1">Pending Count</Text>
              <Text className="text-[#0A2E5C] text-2xl font-bold">{vehiclecount}</Text>
            </View>
          </View>

          {/* Account Status */}
          <View className="border-t border-gray-100 pt-4">
            <Text className="text-[#0A2E5C] font-semibold text-sm mb-3">Account Status</Text>
            {activeProfile.status === 'verified' ? (
              <View className="bg-green-50 px-4 py-3 rounded-lg self-start">
                <Text className="text-green-600 font-semibold text-sm">✅  Verified Account</Text>
              </View>
            ) : (
              <View className="bg-yellow-50 rounded-xl p-3 flex-row items-center justify-between flex-wrap gap-2">
                <Text className="text-yellow-700 font-medium text-sm flex-1">
                  Status: {activeProfile.status || 'Unverified'}
                </Text>
                <TouchableOpacity
                  onPress={handleVerify}
                  className="bg-[#0A2E5C] px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold text-sm">✓  Verify Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
