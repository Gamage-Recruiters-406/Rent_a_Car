import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export const BookingModal = ({ visible, onClose, booking }) => {
  const demoData = {
    customerName: "Jason Lee",
    email: "jasonlee@example.com",
    rating: 3.0,
    pastBookings: "02",
    vehicleName: "Toyota Corolla",
    vehicleNo: "CA-1234",
    vehicleColor: "Red",
    dailyRate: "8,000.00",
    pickupDate: "2026-01-23",
    returnDate: "2026-01-25",
    totalDays: "03",
    totalAmount: "24,000.00",
    status: "PENDING"
  };

  const data = booking || demoData;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[40px] h-[92%] shadow-2xl overflow-hidden">
          
          {/* Header with Close Button */}
          <View className="bg-[#00337C] p-6 flex-row justify-between items-center">
             <Text className="text-white text-xl font-bold italic">Rent A Car</Text>
             <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={30} color="white" />
             </TouchableOpacity>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
            
            {/* Customer Details Section */}
            <View className="flex-row items-center justify-between mb-4">
               <Text className="text-[#00337C] text-xl font-bold">Customer Details</Text>
               <View className="bg-orange-500 px-6 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-xs">{data.status}</Text>
               </View>
            </View>

            <View className="flex-row items-center mb-6">
               <View className="border-2 border-[#00337C] rounded-full p-1">
                  <Image 
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                    className="w-20 h-20 rounded-full"
                  />
               </View>
               <View className="ml-4 flex-1">
                  <Text className="text-slate-800 text-lg font-bold">{data.customerName || data.customer}</Text>
                  <Text className="text-slate-500 text-sm mb-1">{data.email || 'jasonlee@example.com'}</Text>
                  <View className="flex-row items-center">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={16} color={s <= 3 ? "#00337C" : "#D1D5DB"} />
                     ))}
                     <Text className="ml-2 text-slate-500 font-bold">(3.0)</Text>
                  </View>
                  <Text className="text-slate-600 text-xs mt-1 font-medium">Past Bookings: {data.pastBookings || '02'}</Text>
               </View>
            </View>

            <View className="h-[1px] bg-gray-200 mb-6" />

            {/* Vehicle Details Section */}
            <Text className="text-[#00337C] text-xl font-bold mb-4">Vehicle Details</Text>
            <View className="flex-row items-center mb-6">
               <View className="flex-1">
                  <Text className="text-slate-700 text-base font-bold">{data.vehicleName} - {data.vehicleNo}</Text>
                  <Text className="text-slate-500 text-sm mt-1 italic">Color code: {data.vehicleColor || 'Red'}</Text>
                  <Text className="text-[#00337C] text-base font-bold mt-2">LKR {data.dailyRate || '8,000.00'}/Day</Text>
               </View>
               <Image 
                 source={{ uri: 'https://www.pngall.com/wp-content/uploads/2/Toyota-Corolla-PNG-Transparent-HD-Photo.png' }} 
                 className="w-40 h-24"
                 resizeMode="contain"
               />
            </View>

            <View className="h-[1px] bg-gray-200 mb-6" />

            {/* Uploaded Documents */}
            <Text className="text-[#00337C] text-xl font-bold mb-4">Uploaded Documents</Text>
            <DocumentItem name="Driving Licence.pdf" size="02 pages . PDF . 1 MB" />
            <DocumentItem name="ID Card.pdf" size="02 pages . PDF . 1 MB" />

            <View className="h-[1px] bg-gray-200 my-6" />

            {/* Booking Details Section */}
            <Text className="text-[#00337C] text-xl font-bold mb-4">Booking Details</Text>
            <BookingInfoRow label="Pickup Date:" value={data.pickupDate || data.pickup} />
            <BookingInfoRow label="Return date:" value={data.returnDate || data.return} />
            
            <View className="flex-row justify-center items-center mt-4">
               <Text className="text-slate-500 font-bold mr-2">Total Days:</Text>
               <Text className="text-[#00337C] font-bold text-sm ">{data.totalDays || '03'}</Text>
            </View>

            {/* Total Price Box */}
            <View className="bg-[#00337C] mx-10 py-4 rounded-2xl items-center mt-4 mb-10 shadow-lg">
               <Text className="text-white text-sm font-bold">LKR {data.totalAmount || data.price}</Text>
            </View>

          </ScrollView>

          {/* Bottom Action Buttons */}
          <View className="flex-row px-6 pb-10 space-x-4">
             <TouchableOpacity className="flex-1 bg-[#00A343] py-4 rounded-2xl items-center shadow-md">
                <Text className="text-white font-bold text-sm">Approve Request</Text>
             </TouchableOpacity>
             <TouchableOpacity className="flex-1 bg-[#E6423C] py-4 rounded-2xl items-center shadow-md">
                <Text className="text-white font-bold text-sm">Reject Request</Text>
             </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const DocumentItem = ({ name, size }) => (
  <View className="flex-row items-center border border-gray-200 rounded-3xl p-3 mb-3">
     <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/337/337946.png' }} className="w-10 h-10" />
     <View className="ml-3 flex-1">
        <Text className="text-[#00337C] font-bold text-sm">{name}</Text>
        <Text className="text-gray-400 text-xs">{size}</Text>
     </View>
     <Ionicons name="download-outline" size={24} color="gray" />
  </View>
);

const BookingInfoRow = ({ label, value }) => (
  <View className="flex-row justify-between items-center mb-2 px-4">
     <Text className="text-slate-600 text-base font-medium">{label}</Text>
     <Text className="text-[#00337C] text-base font-bold">{value}</Text>
  </View>
);