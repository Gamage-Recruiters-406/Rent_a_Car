import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, Text, Platform, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BookingModal } from '../../components/BookingModal';

const { width } = Dimensions.get('window');
const API_URL = "http://192.168.1.5:8000/api/v1/bookings/get";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
      Alert.alert("Error", "Could not fetch bookings. Make sure you are Admin.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const filteredData = bookings.filter(item => 
    activeTab === 'All' ? true : item.status.toLowerCase() === activeTab.toLowerCase()
  );

  const stats = [
    { id: '1', title: 'Total', count: bookings.length, icon: 'car-outline' },
    { id: '2', title: 'Pending', count: bookings.filter(b => b.status === 'pending').length, icon: 'hourglass-outline' },
    { id: '3', title: 'Approved', count: bookings.filter(b => b.status === 'approved').length, icon: 'checkmark-circle-outline' },
    { id: '4', title: 'Rejected', count: bookings.filter(b => b.status === 'rejected').length, icon: 'close-circle-outline' },
  ];

  if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" color="#00337C" /></View>;

  return (
    <View className="flex-1 bg-slate-50">
      <View className={`px-4 bg-white border-b border-gray-200 ${Platform.OS === 'ios' ? 'pt-14 pb-4' : 'pt-10 pb-4'}`}>
        <Text className="text-center text-lg font-bold text-[#00337C]">Admin Dashboard</Text>
      </View>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false} className="py-5"
      >
        {/* Stats Cards */}
        <View className="flex-row flex-wrap justify-between px-5">
          {stats.map(s => (
            <View key={s.id} className="w-[48%] bg-white rounded-2xl mb-4 flex-row shadow-sm elevation-2 overflow-hidden">
              <View className="w-1.5 bg-[#00337C]" />
              <View className="flex-1 p-4 items-center">
                <Ionicons name={s.icon} size={24} color="#00337C" />
                <Text className="text-[10px] text-gray-500 font-bold mt-1 uppercase">{s.title}</Text>
                <Text className="text-xl font-bold text-[#00337C]">{s.count}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Status Tabs */}
        <View className="flex-row bg-gray-200 rounded-lg mx-5 mt-2 p-1">
          {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-md ${activeTab === tab ? 'bg-[#00337C]' : ''}`}>
              <Text className={`text-center text-xs ${activeTab === tab ? 'text-white font-bold' : 'text-gray-600'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Horizontal Booking Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 px-5" contentContainerStyle={{ paddingRight: 40 }}>
          {filteredData.map(item => (
            <View key={item._id} style={{ width: width * 0.82 }} className="bg-white rounded-2xl p-4 mr-4 shadow-md border border-gray-100">
              <TableRow label="Customer" value={`${item.customerId?.first_name} ${item.customerId?.last_name}`} />
              <TableRow label="Vehicle" value={item.vehicleId?.title} />
              <TableRow label="Reg No" value={item.vehicleId?.numberPlate} />
              <TableRow label="Pickup" value={new Date(item.startingDate).toLocaleDateString()} />
              <TableRow label="Amount" value={`Rs. ${item.totalAmount}`} />
              <TableRow label="Status" value={item.status} isStatus />
              
              <TouchableOpacity 
                onPress={() => { setSelectedBooking(item); setModalVisible(true); }}
                className="bg-[#00337C] py-3.5 rounded-xl mt-4 items-center flex-row justify-center"
              >
                <Ionicons name="eye-outline" size={18} color="white" style={{marginRight: 8}} />
                <Text className="text-white font-bold text-xs uppercase">View Request</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <BookingModal 
        visible={modalVisible} 
        onClose={() => { setModalVisible(false); fetchBookings(); }} 
        booking={selectedBooking} 
      />
    </View>
  );
}

function TableRow({ label, value, isStatus }) {
  const getStatusColor = (v) => {
    if (v === 'approved') return 'text-green-600';
    if (v === 'pending') return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <View className="flex-row justify-between py-2.5 border-b border-gray-50">
      <Text className="text-gray-400 text-[10px] font-bold uppercase">{label}</Text>
      <Text className={`text-xs font-semibold ${isStatus ? getStatusColor(value) : 'text-[#00337C]'}`}>
        {value || 'N/A'}
      </Text>
    </View>
  );
}