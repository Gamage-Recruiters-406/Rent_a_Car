import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export const BookingModal = ({ visible, onClose, booking, refreshData, allBookings = [] }) => {
  const [loading, setLoading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null); // බාගත වන file එකේ නම තබා ගැනීමට

  if (!booking) return null;

  // --- Document Download Logic ---
  const handleDownload = async (fileName) => {
    try {
      setDownloadingFile(fileName);
      
      // 1. Backend එකේ file එක තියෙන සම්පූර්ණ URL එක (ඔබේ backend path එකට අනුව සකසන්න)
      const fileUrl = `${baseUrl}/uploads/documents/${fileName}`; 
      const fileUri = FileSystem.documentDirectory + fileName;

      // 2. File එක බාගත කිරීම
      const downloadRes = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (downloadRes.status === 200) {
        // 3. බාගත වූ පසු එය Open කිරීමට හෝ Share කිරීමට window එක පෙන්වීම
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("දෝෂයක්", "ගොනුව බාගත කිරීමට නොහැකි විය.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("දෝෂයක්", "බාගත කිරීමේදී ගැටලුවක් ඇති විය.");
    } finally {
      setDownloadingFile(null);
    }
  };

  const getPastBookingsCount = () => {
    if (!booking.customerId?._id || !allBookings.length) return "00";
    const count = allBookings.filter(b => 
      b.customerId?._id === booking.customerId?._id && 
      b.status === 'approved' &&
      b._id !== booking._id 
    ).length;
    return count < 10 ? `0${count}` : count;
  };

  const calculateTotalDays = (start, end) => {
    if (!start || !end) return "00";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays < 10 ? `0${diffDays}` : diffDays;
  };

  const handleUpdateStatus = async (action) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const cleanToken = token ? token.replace(/"/g, '') : null;
      const API_URL = `${baseUrl}${apiVersion}/bookings/${action}/${booking._id}`;
      
      const response = await axios.patch(API_URL, {}, { 
        headers: { 'Authorization': `Bearer ${cleanToken}` } 
      });

      if (response.data.success) {
        Alert.alert("සාර්ථකයි", response.data.message);
        if (refreshData) refreshData(); 
        onClose();
      }
    } catch (error) {
      Alert.alert("දෝෂයක්", error.response?.data?.message || "ක්‍රියාවලිය අසාර්ථකයි");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[20px] h-[92%] shadow-2xl overflow-hidden">
          
          <View className="bg-[#00337C] p-6 flex-row justify-between items-center">
             <Text className="text-white text-xl font-bold italic">Rent A Car</Text>
             <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={30} color="white" />
             </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            
            <View className="flex-row items-center justify-between mb-4">
               <Text className="text-[#00337C] text-xl font-bold">Customer Details</Text>
               <View className={`px-6 py-1.5 rounded-full ${booking.status === 'approved' ? 'bg-green-600' : 'bg-orange-500'}`}>
                  <Text className="text-white font-bold text-xs uppercase">{booking.status}</Text>
               </View>
            </View>

            <View className="flex-row items-center mb-6">
               <View className="border-2 border-[#00337C] rounded-full p-1">
                  <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} className="w-20 h-20 rounded-full" />
               </View>
               <View className="ml-4 flex-1">
                  <Text className="text-slate-800 text-lg font-bold">{booking.customerId?.first_name} {booking.customerId?.last_name}</Text>
                  <Text className="text-slate-500 text-sm mb-1">{booking.customerId?.email}</Text>
                  <Text className="text-slate-500 text-sm mb-1">{booking.customerId?.contactNumber || 'No Contact'}</Text>
                  <Text className="text-slate-600 text-xs mt-1 font-medium">Past Bookings: {getPastBookingsCount()}</Text>
               </View>
            </View>

            <View className="h-[1px] bg-gray-200 mb-6" />

            <Text className="text-[#00337C] text-xl font-bold mb-4">Vehicle Details</Text>
            <View className="flex-row items-center mb-6">
               <View className="flex-1">
                  <Text className="text-slate-700 text-base font-bold">{booking.vehicleId?.title}</Text>
                  <Text className="text-slate-500 text-sm mt-1 italic">{booking.vehicleId?.numberPlate}</Text>
                  <Text className="text-[#00337C] text-base font-bold mt-2">LKR {booking.dailyRate?.toLocaleString()}/Day</Text>
               </View>
               {booking.vehicleId?.images?.[0] ? (
                 <Image source={{ uri: booking.vehicleId.images[0] }} className="w-40 h-24" resizeMode="contain" />
               ) : (
                 <View className="w-40 h-24 bg-slate-50 rounded-2xl items-center justify-center border border-slate-200">
                    <Ionicons name="car-sport-outline" size={45} color="#00337C" />
                 </View>
               )}
            </View>

            <View className="h-[1px] bg-gray-200 mb-6" />

            {/* Documents Section */}
            <Text className="text-[#00337C] text-xl font-bold mb-4">Uploaded Documents</Text>
            {booking.documents && booking.documents.length > 0 ? (
              booking.documents.map((doc, index) => (
                <View key={index} className="flex-row items-center border border-gray-200 rounded-3xl p-3 mb-3">
                   <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/337/337946.png' }} className="w-10 h-10" />
                   <View className="ml-3 flex-1">
                      <Text className="text-[#00337C] font-bold text-sm" numberOfLines={1}>{doc}</Text>
                      <Text className="text-gray-400 text-xs italic">Verified Document</Text>
                   </View>
                   <TouchableOpacity onPress={() => handleDownload(doc)}>
                      {downloadingFile === doc ? (
                        <ActivityIndicator size="small" color="#00337C" />
                      ) : (
                        <Ionicons name="download-outline" size={24} color="#00337C" />
                      )}
                   </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 italic mb-4 text-center">No documents available</Text>
            )}

            <View className="h-[1px] bg-gray-200 my-6" />

            <Text className="text-[#00337C] text-xl font-bold mb-4">Booking Details</Text>
            <BookingInfoRow label="Pickup Date:" value={new Date(booking.startingDate).toLocaleDateString()} />
            <BookingInfoRow label="Return date:" value={new Date(booking.endDate).toLocaleDateString()} />
            
            <View className="flex-row justify-center items-center mt-4">
               <Text className="text-slate-500 font-bold mr-2">Total Days:</Text>
               <Text className="text-[#00337C] font-bold text-lg ">
                {calculateTotalDays(booking.startingDate, booking.endDate)}
               </Text>
            </View>

            <View className="bg-[#00337C] mx-10 py-4 rounded-2xl items-center mt-4 mb-10 shadow-lg">
               <Text className="text-white text-lg font-bold">LKR {booking.totalAmount?.toLocaleString()}</Text>
            </View>

          </ScrollView>

          {booking.status === 'pending' && (
            <View className="flex-row px-6 pb-10 space-x-4">
               <TouchableOpacity onPress={() => handleUpdateStatus('approve')} disabled={loading} className="flex-1 bg-[#00A343] py-4 rounded-2xl items-center shadow-md">
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-sm">Approve Request</Text>}
               </TouchableOpacity>
               <TouchableOpacity onPress={() => handleUpdateStatus('reject')} disabled={loading} className="flex-1 bg-[#E6423C] py-4 rounded-2xl items-center shadow-md">
                  <Text className="text-white font-bold text-sm">Reject Request</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const BookingInfoRow = ({ label, value }) => (
  <View className="flex-row justify-between items-center mb-2 px-4">
      <Text className="text-slate-600 text-base font-medium">{label}</Text>
      <Text className="text-[#00337C] text-base font-bold">{value}</Text>
  </View>
);