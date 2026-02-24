import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { Mail, Phone, MapPin, Calendar, Edit, Save, User, X, Camera, Trash2, CheckCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL; 
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function OwnerProfileEdit() {
  const router = useRouter();
  const [activeProfile, setActiveProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [earningsData, setEarningsData] = useState({ totalEarnings: 0 });
  const [bookingsCount, setBookingsCount] = useState(0);
  const [vehicleStats, setVehicleStats] = useState({ count: 0 });
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

        const [profileRes, earningsRes, bookingsRes, vehiclesRes] = await Promise.all([
          axios.get(`${baseUrl}${apiVersion}/authUser/getUserDetails`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${baseUrl}${apiVersion}/bookings/owner/earnings/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${baseUrl}${apiVersion}/bookings/owner/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${baseUrl}${apiVersion}/vehicle/get-my-all`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (profileRes.data) {
          const userData = profileRes.data.user || profileRes.data; 
          const mappedProfile = {
            ...userData,
            phone: userData.contactNumber || userData.phone || '',
            subtitle: userData.role === 2 ? 'Owner' : (userData.role === 1 ? 'User' : 'Admin'),
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || '',
            createdAt: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
          };
          setActiveProfile(mappedProfile);
          setEditedProfile(mappedProfile);
          if (userData.profilePicture) {
            setImageUri(`${baseUrl}/${userData.profilePicture}`);
          }
        }

        if (earningsRes.data) setEarningsData(earningsRes.data.data || { totalEarnings: 0 });
        if (bookingsRes.data) setBookingsCount(bookingsRes.data.data?.length || 0);
        if (vehiclesRes.data) {
          const vehicles = vehiclesRes.data.vehicles || [];
          setVehicleStats({ count: vehicles.length, pending: vehicles.filter(v => v.status === "Pending").length });
        }
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
      Alert.alert("Error", "Failed to load data");
    }
  };

  const handleImagePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert("Permission Required", "Gallery access needed."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();
      Object.keys(editedProfile).forEach(key => {
        if (editedProfile[key] !== null) formData.append(key, editedProfile[key]);
      });
      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append("profilePicture", { uri: imageUri, name: filename, type });
      }

      const res = await axios.put(`${baseUrl}${apiVersion}/authUser/Updateuser`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        Alert.alert("Success", "Profile updated");
        setActiveProfile({ ...editedProfile, profilePicture: res.data.user?.profilePicture || activeProfile.profilePicture });
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Error", "Update failed");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Delete Account", "Are you sure? Permanent action.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const token = await AsyncStorage.getItem('userToken');
        await axios.delete(`${baseUrl}${apiVersion}/authUser/deleteAccount`, { headers: { 'Authorization': `Bearer ${token}` } });
        await AsyncStorage.multiRemove(['user', 'userToken']);
        router.replace('/');
      }}
    ]);
  };

  const currentProfile = isEditing ? editedProfile : activeProfile;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-[#0A2E5C] px-6 py-10">
        <View className="flex-row items-center space-x-4 mb-6">
          <View className="relative">
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center overflow-hidden">
              <Image source={{ uri: imageUri || currentProfile.avatar || "https://avatar.iran.liara.run/public/boy?username=" }} className="w-full h-full" />
            </View>
            {isEditing && (
              <TouchableOpacity onPress={handleImagePick} className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <Camera size={16} color="#0A2E5C" />
              </TouchableOpacity>
            )}
          </View>
          <View>
            <Text className="text-white text-2xl font-bold">{currentProfile.name}</Text>
            <Text className="text-white/80 text-sm">{currentProfile.subtitle}</Text>
          </View>
        </View>

        <View className="flex-row space-x-3">
          {isEditing ? (
            <>
              <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 bg-white/10 py-3 rounded-lg"><Text className="text-white text-center">Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} className="flex-1 bg-white py-3 rounded-lg"><Text className="text-[#0A2E5C] text-center font-bold">Save</Text></TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleDeleteAccount} className="flex-1 bg-red-500/10 py-3 rounded-lg"><Text className="text-red-500 text-center">Delete</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-1 bg-white py-3 rounded-lg"><Text className="text-[#0A2E5C] text-center font-bold">Edit Profile</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="px-6 py-8">
        <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <Text className="text-[#0A2E5C] font-bold text-lg mb-6">Personal Information</Text>
          <View className="space-y-6">
            <ProfileItem label="First Name" value={currentProfile.first_name} onChangeText={t => setEditedProfile({...editedProfile, first_name: t})} editable={isEditing} />
            <ProfileItem label="Last Name" value={currentProfile.last_name} onChangeText={t => setEditedProfile({...editedProfile, last_name: t})} editable={isEditing} />
            <ProfileItem label="Email" value={currentProfile.email} editable={false} />
            <ProfileItem label="Phone" value={currentProfile.contactNumber} onChangeText={t => setEditedProfile({...editedProfile, contactNumber: t})} editable={isEditing} />
            <ProfileItem label="Location" value={currentProfile.location} onChangeText={t => setEditedProfile({...editedProfile, location: t})} editable={isEditing} />
          </View>
          <View className="mt-8">
            <Text className="text-[#0A2E5C] font-bold text-base mb-3">Bio</Text>
            <TextInput className="bg-gray-50 rounded-xl p-4 text-gray-600 text-sm" value={currentProfile.bio} onChangeText={t => setEditedProfile({...editedProfile, bio: t})} editable={isEditing} multiline numberOfLines={3} placeholder="About your business..." />
          </View>
        </View>

        <View className="bg-white rounded-2xl shadow-sm p-6">
          <Text className="text-[#0A2E5C] font-bold text-lg mb-6">Account Stats</Text>
          <View className="flex-row flex-wrap">
            <Stat label="Vehicles" value={vehicleStats.count} />
            <Stat label="Total Bookings" value={bookingsCount} />
            <Stat label="Earnings" value={`RS.${earningsData.totalEarnings}`} />
            <Stat label="Pending Approval" value={vehicleStats.pending} />
          </View>
          
          <View className="mt-8 border-t border-gray-100 pt-6">
            <Text className="text-[#0A2E5C] font-bold mb-3">Account Status</Text>
            {activeProfile.status === 'verified' ? (
              <View className="flex-row items-center bg-green-50 p-3 rounded-xl"><CheckCircle size={20} color="green" /><Text className="text-green-600 font-bold ml-2">Verified Account</Text></View>
            ) : (
              <View className="bg-yellow-50 p-4 rounded-xl flex-row items-center justify-between">
                <Text className="text-yellow-700 font-bold">Unverified</Text>
                <TouchableOpacity className="bg-[#0A2E5C] px-4 py-2 rounded-lg"><Text className="text-white text-xs font-bold">Verify Now</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const ProfileItem = ({ label, value, onChangeText, editable = true }) => (
  <View className="border-b border-gray-50 pb-4">
    <Text className="text-gray-400 text-xs uppercase mb-1">{label}</Text>
    <TextInput className={`text-[#0A2E5C] font-medium p-0 ${editable ? 'text-blue-600' : ''}`} value={value || ''} onChangeText={onChangeText} editable={editable} />
  </View>
);

const Stat = ({ label, value }) => (
  <View className="w-1/2 mb-6">
    <Text className="text-gray-400 text-xs uppercase mb-1">{label}</Text>
    <Text className="text-[#0A2E5C] text-2xl font-bold">{value}</Text>
  </View>
);
