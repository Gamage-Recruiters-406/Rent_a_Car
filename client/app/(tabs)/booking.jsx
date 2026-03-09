import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Text, 
  ActivityIndicator, 
  RefreshControl, 
  TextInput,
  Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BookingModal } from '../../components/owner/BookingModal'; 

const { width } = Dimensions.get('window');
const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken'); 
      const ownerId = await AsyncStorage.getItem('userId');
      const cleanToken = token ? token.replace(/"/g, '') : null;
      const cleanOwnerId = ownerId ? ownerId.replace(/"/g, '') : null;

      if (!cleanOwnerId || !cleanToken) {
        setLoading(false);
        return;
      }

      const API_URL = `${baseUrl}${apiVersion}/bookings/owner/${cleanOwnerId}`;
      const response = await axios.get(API_URL, {
        headers: { 
          'Authorization': `Bearer ${cleanToken}` 
        },
        withCredentials: true 
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
      } 
    } catch (error) {
      console.error("Fetch Error:", error.message);
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

  const filteredData = bookings.filter(item => {
    const matchesTab = activeTab === 'All' ? true : item.status?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = item.vehicleId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.customerId?.first_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = [
    { id: '1', title: 'Total Requests', count: bookings.length, icon: 'car-outline' },
    { id: '2', title: 'Pending Requests', count: bookings.filter(b => b.status === 'pending').length, icon: 'hourglass-outline' },
    { id: '3', title: 'Approved Requests', count: bookings.filter(b => b.status === 'approved').length, icon: 'checkmark-circle-outline' },
    { id: '4', title: 'Rejected Requests', count: bookings.filter(b => b.status === 'rejected').length, icon: 'close-circle-outline' },
  ];

  if (loading) return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <ActivityIndicator size="large" color="#00337C" />
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mt-6">
          <Text className="text-2xl font-bold text-[#00337C]">Booking Request</Text>
          <Text className="text-gray-500 text-xs text-center px-10">Manage incoming booking requests from customers</Text>
        </View>

        <View className="flex-row flex-wrap justify-between px-5 mt-5">
          {stats.map(s => (
            <View key={s.id} className="w-[48%] bg-white rounded-2xl mb-4 p-5 shadow-sm border border-gray-100 items-center justify-center">
              <Ionicons name={s.icon} size={28} color="#00337C" />
              <Text className="text-[10px] text-[#00337C] font-semibold text-center mt-2 uppercase tracking-tighter">{s.title}</Text>
              <Text className="text-2xl font-bold text-[#00337C] mt-1">{s.count}</Text>
            </View>
          ))}
        </View>

        <Text className="text-center text-lg font-bold text-[#00337C] mt-4 mb-3">Booking Requests List</Text>

        <View className="flex-row bg-[#E5E9F2] rounded-xl mx-5 p-1 mb-5">
          {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)} 
              className={`flex-1 py-2.5 rounded-lg ${activeTab === tab ? 'bg-[#00337C]' : ''}`}
            >
              <Text className={`text-center text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar - Height adu kara, black border ain kara */}
        <View className="mx-5 mb-6 flex-row items-center border border-[#00337C] rounded-lg px-3 bg-white shadow-sm h-10">
          <Ionicons name="search-outline" size={16} color="#00337C" />
          <TextInput 
            placeholder="Search bookings..." 
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-xs text-[#00337C]"
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
            underlineColorAndroid="transparent"
            selectionColor="#00337C"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          persistentScrollbar={true}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
          snapToInterval={width * 0.85 + 16}
          decelerationRate="fast"
        >
          {filteredData.length > 0 ? (
            filteredData.map(item => (
              <View 
                key={item._id} 
                style={{ width: width * 0.85 }} 
                className="bg-white rounded-sm mr-4 shadow-xl border border-gray-200 overflow-hidden"
              >
                <DataRow label="Customer" value={`${item.customerId?.first_name || ''} ${item.customerId?.last_name || ''}`} />
                <DataRow label="Vehicle No" value={item.vehicleId?.numberPlate} />
                <DataRow label="Vehicle Name" value={item.vehicleId?.title} />
                <DataRow label="Pickup Date" value={item.startingDate ? new Date(item.startingDate).toLocaleDateString() : 'N/A'} />
                <DataRow label="Return Date" value={item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'} />
                <DataRow label="Total Price" value={`LKR ${item.totalAmount?.toLocaleString()}`} />
                <DataRow label="Status" value={item.status} isStatus />
                
                <View className="flex-row h-14">
                  <View className="bg-[#0D3A73] w-[45%] justify-center items-center">
                    <Text className="text-white font-medium text-sm">Action</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => { setSelectedBooking(item); setModalVisible(true); }}
                    className="flex-1 bg-white items-center justify-center active:bg-blue-50 border-b border-[#0D3A73]"
                  >
                    <Ionicons name="document-text-outline" size={26} color="#00337C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={{ width: width - 40 }} className="items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Ionicons name="file-tray-outline" size={40} color="#cbd5e1" />
              <Text className="text-gray-400 font-bold mt-2">No Records Found</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>

      {/* AdminDashboard.js ඇතුළත */}
      {selectedBooking && (
        <BookingModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking} // මෙහි නම 'booking' විය යුතුයි
          refreshData={fetchBookings} // Refresh function එක pass කරන්න
          allBookings={bookings}
        />
      )}
    </View>
  );
}

function DataRow({ label, value, isStatus }) {
  const getStatusColor = (val) => {
    const s = val?.toLowerCase();
    if (s === 'approved') return 'text-green-600';
    if (s === 'pending') return 'text-orange-500';
    return 'text-red-600';
  };

  return (
    <View className="flex-row">
      <View className="bg-[#0D3A73] w-[45%] p-4 justify-center items-center border-b border-r border-white/10">
        <Text className="text-white text-[12px] font-bold text-center uppercase tracking-tighter">{label}</Text>
      </View>
      <View className="flex-1 p-4 bg-white justify-center items-center border-b border-[#0D3A73]">
        <Text 
          numberOfLines={1} 
          className={`text-[13px] font-bold text-center ${isStatus ? getStatusColor(value) : 'text-[#3E5C96]'}`}
        >
          {value || 'N/A'}
        </Text>
      </View>
    </View>
  );
}