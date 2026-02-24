import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { Mail, Phone, MapPin, Calendar, Edit, Save, User, X, Camera, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL; 
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function CustomerProfileEdit() {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [customerBookings, setCustomerBookings] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('userToken');
     
      if (storedUser && token) {
        const userObj = JSON.parse(storedUser);
        const userId = userObj.user ? userObj.user._id : (userObj._id || userObj.userid);

        const response = await axios.get(`${baseUrl}${apiVersion}/authUser/getUserDetails`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const response2 = await axios.get(`${baseUrl}${apiVersion}/bookings/customer/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data) {
          const userData = response.data.user || response.data; 
          const mappedProfile = {                    
            ...userData,
            contactNumber: userData.contactNumber || userData.phone || '',
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
            createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
          };
          
          setActiveProfile(mappedProfile);
          setEditedProfile(mappedProfile);
          if (userData.profilePicture) {
            setImageUri(`${baseUrl}/${userData.profilePicture}`);
          }
        }

        if (response2.data) {
          setCustomerBookings(response2.data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Access to gallery is needed to change picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== null && editedProfile[key] !== undefined) {
          formData.append(key, editedProfile[key]);
        }
      });
      
      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("profilePicture", { uri: imageUri, name: filename, type });
      }

      const response = await axios.put(`${baseUrl}${apiVersion}/authUser/updateUser/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        Alert.alert("Success", "Profile updated successfully");
        const updatedProfile = { ...editedProfile };
        if (response.data.user && response.data.user.profilePicture) {
          updatedProfile.profilePicture = response.data.user.profilePicture;
          setImageUri(`${baseUrl}/${response.data.user.profilePicture}`);
        }
        setActiveProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile data");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const response = await axios.delete(`${baseUrl}${apiVersion}/authUser/deleteAccount`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.data && response.data.success) {
                await AsyncStorage.multiRemove(['user', 'userToken', 'userId']);
                router.replace('/');
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "An error occurred");
            }
          }
        }
      ]
    );
  };

  const currentProfile = isEditing ? editedProfile : activeProfile;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-[#0A2E5C] px-6 py-10">
        <View className="flex-row items-center space-x-4 mb-6">
          <View className="relative">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center overflow-hidden">
              <Image 
                source={{ uri: imageUri || currentProfile.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop" }} 
                className="w-full h-full" 
              />
            </View>
            {isEditing && (
              <TouchableOpacity onPress={handleImagePick} className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <Camera size={16} color="#0A2E5C" />
              </TouchableOpacity>
            )}
          </View>
          <View>
            <Text className="text-white text-2xl font-bold capitalize">
              {currentProfile.first_name} {currentProfile.last_name}
            </Text>
            <Text className="text-white/80 text-sm">Customer</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 flex-row items-center justify-center bg-white/10 py-3 rounded-lg">
                <X size={18} color="white" /><Text className="text-white font-medium ml-2">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="flex-1 flex-row items-center justify-center bg-white py-3 rounded-lg">
                <Save size={18} color="#0A2E5C" /><Text className="text-[#0A2E5C] font-medium ml-2">Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleDeleteAccount} className="flex-1 flex-row items-center justify-center bg-red-500/10 py-3 rounded-lg">
                <Trash2 size={18} color="#ef4444" /><Text className="text-red-500 font-medium ml-2">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-1 flex-row items-center justify-center bg-white py-3 rounded-lg">
                <Edit size={18} color="#0A2E5C" /><Text className="text-[#0A2E5C] font-medium ml-2">Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6 py-8">
        <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <Text className="text-[#0A2E5C] font-bold text-lg mb-6">Personal Information</Text>
          <View className="space-y-6">
            <InputField label="First Name" value={currentProfile.first_name} onChangeText={(t) => setEditedProfile({...editedProfile, first_name: t})} editable={isEditing} icon={<User size={20} color="#9ca3af" />} />
            <InputField label="Last Name" value={currentProfile.last_name} onChangeText={(t) => setEditedProfile({...editedProfile, last_name: t})} editable={isEditing} icon={<User size={20} color="#9ca3af" />} />
            <InputField label="Email" value={currentProfile.email} editable={false} icon={<Mail size={20} color="#9ca3af" />} />
            <InputField label="Phone" value={currentProfile.contactNumber} onChangeText={(t) => setEditedProfile({...editedProfile, contactNumber: t})} editable={isEditing} icon={<Phone size={20} color="#9ca3af" />} />
            <InputField label="Location" value={currentProfile.location} onChangeText={(t) => setEditedProfile({...editedProfile, location: t})} editable={isEditing} icon={<MapPin size={20} color="#9ca3af" />} />
            <View className="flex-row items-center space-x-3"><Calendar size={20} color="#9ca3af" /><View><Text className="text-gray-400 text-xs uppercase">Member Since</Text><Text className="text-[#0A2E5C] font-medium">{currentProfile.createdAt}</Text></View></View>
          </View>
          <View className="mt-8">
            <Text className="text-[#0A2E5C] font-bold text-base mb-3">Bio</Text>
            <TextInput className="bg-gray-50 rounded-xl p-4 text-gray-600 text-sm" value={currentProfile.bio} onChangeText={(t) => setEditedProfile({...editedProfile, bio: t})} editable={isEditing} multiline numberOfLines={4} placeholder="Tell us about yourself..." />
          </View>
        </View>

        {/* Stats Section */}
        <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <Text className="text-[#0A2E5C] font-bold text-lg mb-6">Account Stats</Text>
          <View className="flex-row flex-wrap">
            <StatItem label="All Bookings" value={customerBookings.length} />
            <StatItem label="Pending" value={customerBookings.filter(b => b.status === 'pending').length} />
            <StatItem label="Cancelled" value={customerBookings.filter(b => b.status === 'cancelled').length} />
            <StatItem label="Total Spends" value={`RS.${customerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)}`} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const InputField = ({ label, value, onChangeText, editable, icon }) => (
  <View className="flex-row items-center space-x-3 border-b border-gray-100 pb-4">
    {icon}<View className="flex-1"><Text className="text-gray-400 text-xs uppercase">{label}</Text>
    <TextInput className={`text-[#0A2E5C] font-medium p-0 ${editable ? 'text-blue-600' : ''}`} value={value || ''} onChangeText={onChangeText} editable={editable} /></View>
  </View>
);

const StatItem = ({ label, value }) => (
  <View className="w-1/2 mb-6">
    <Text className="text-gray-400 text-xs uppercase mb-1">{label}</Text>
    <Text className="text-[#0A2E5C] text-2xl font-bold">{value}</Text>
  </View>
);
