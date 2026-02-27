import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker/js';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import {
  Calendar as CalendarIconLucide,
  DollarSign,
  Fuel,
  Info,
  MapPin,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react-native';

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const apiVersion = process.env.EXPO_PUBLIC_API_VERSION;

const defaultFilters = {
  location: '',
  startDate: '',
  endDate: '',
  vehicleType: '',
  transmission: '',
  fuelType: '',
  minPrice: '',
  maxPrice: '',
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString();
};

// Helper function to get rating value
const getRatingValue = (vehicle) => {
  if (vehicle?.rating) return vehicle.rating;
  if (vehicle?.averageRating) return vehicle.averageRating;
  return 0;
};

// Helper function to get review count
const getReviewCount = (vehicle) => {
  if (vehicle?.reviewCount) return vehicle.reviewCount;
  if (vehicle?.totalReviews) return vehicle.totalReviews;
  if (Array.isArray(vehicle?.reviews)) return vehicle.reviews.length;
  return 0;
};

// Helper to convert photo URLs
const toFullImageUrl = (url, baseApiUrl) => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseApiUrl}${path}`;
};

const getPhotoUrls = (vehicle, baseApiUrl) => {
  const out = [];
  if (Array.isArray(vehicle?.photos) && vehicle.photos.length > 0) {
    vehicle.photos.forEach((p) => {
      const u = p && (typeof p === 'string' ? p : p.url);
      const full = toFullImageUrl(u, baseApiUrl);
      if (full) out.push(full);
    });
  }
  if (out.length) return out;
  if (vehicle?.image && typeof vehicle.image === 'string') {
    const full = toFullImageUrl(vehicle.image, baseApiUrl);
    if (full) return [full];
  }
  if (Array.isArray(vehicle?.images)) {
    vehicle.images.forEach((u) => {
      const full = typeof u === 'string' ? toFullImageUrl(u, baseApiUrl) : (u?.url ? toFullImageUrl(u.url, baseApiUrl) : null);
      if (full) out.push(full);
    });
  }
  return out;
};

export default function CustomerVehicleList() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedReviewCount, setSelectedReviewCount] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const url = `${baseUrl}${apiVersion}/vehicle/get-all`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Login Required', 'Please login to view vehicles.');
          setVehicles([]);
          return;
        }
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      const vehicleList = data.vehicles || data.data || [];
      
      // Normalize vehicles with photos
      const normalizedVehicles = (Array.isArray(vehicleList) ? vehicleList : []).map((vehicle) => ({
        ...vehicle,
        photos: getPhotoUrls(vehicle, baseUrl),
      }));
      
      setVehicles(normalizedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartDateChange = (date) => {
    const dateString = date;
    setStartDate(new Date(date));
    handleFilterChange('startDate', dateString);
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (date) => {
    const dateString = date;
    setEndDate(new Date(date));
    handleFilterChange('endDate', dateString);
    setShowEndDatePicker(false);
  };

  const handleSearch = () => {
    // Filtering happens locally via memoized list
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    setSelectedRating(0);
    setSelectedReviewCount(0);
  };

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedRating(getRatingValue(vehicle));
    setSelectedReviewCount(getReviewCount(vehicle));
    setIsModalOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (
        filters.location &&
        !vehicle.address?.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType) {
        return false;
      }
      if (filters.transmission && vehicle.transmission !== filters.transmission) {
        return false;
      }
      if (filters.fuelType && vehicle.fuelType !== filters.fuelType) {
        return false;
      }
      if (filters.maxPrice && Number(vehicle.pricePerDay) > Number(filters.maxPrice)) {
        return false;
      }
      if (filters.minPrice && Number(vehicle.pricePerDay) < Number(filters.minPrice)) {
        return false;
      }
      return true;
    });
  }, [vehicles, filters]);

  const renderVehicleCard = ({ item }) => {
    const ratingValue = getRatingValue(item);
    const reviewCount = getReviewCount(item);

    return (
      <View className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-5">
        <View className="relative h-44 bg-gray-200">
          {item.photos?.length ? (
            <Image
              source={{ uri: item.photos[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-300">
              <Text className="text-4xl">🚗</Text>
              <Text className="text-sm text-gray-600 mt-2">No Image</Text>
            </View>
          )}
          <View className="absolute top-3 right-3 bg-white/95 rounded-lg px-3 py-1.5 flex-row items-center gap-1 shadow-md">
            <Star size={16} color="#FACC15" fill="#FACC15" />
            <Text className="text-sm font-bold text-gray-800">
              {(ratingValue ?? 0).toFixed(1)}
            </Text>
            {reviewCount > 0 && (
              <Text className="text-xs text-gray-600">({reviewCount})</Text>
            )}
          </View>
        </View>

        <View className="p-4">
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {item.title || 'Vehicle'}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {item.year ? `${item.year} • ` : ''}
              {item.vehicleType || ''}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-lg p-3 mb-4 flex-row justify-between">
            <View className="flex-row items-center gap-2">
              <Fuel size={16} color="#2563EB" />
              <View>
                <Text className="text-xs text-gray-600">Fuel</Text>
                <Text className="text-sm font-semibold text-gray-900">{item.fuelType || 'N/A'}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Zap size={16} color="#2563EB" />
              <View>
                <Text className="text-xs text-gray-600">Transmission</Text>
                <Text className="text-sm font-semibold text-gray-900">{item.transmission || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-start gap-2 mb-4">
            <MapPin size={16} color="#EF4444" />
            <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
              {item.location?.address || item.address || 'Location not specified'}
            </Text>
          </View>

          <View className="border-t border-gray-200 my-3" />

          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-xs text-gray-600 font-medium">Per Day</Text>
              <Text className="text-xl font-bold text-gray-900">
                <Text className="text-sm text-gray-600">LKR </Text>
                {formatPrice(item.pricePerDay)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-600 font-medium">Per KM</Text>
              <Text className="text-lg font-bold text-gray-900">
                <Text className="text-sm text-gray-600">LKR </Text>
                {formatPrice(item.pricePerKm)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => openModal(item)}
            className="w-full bg-[#0D3778] py-2.5 rounded-lg"
          >
            <Text className="text-white font-semibold text-center">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-[#0D3778] px-4 py-10">
          <Text className="text-3xl font-bold text-white">Find Your Perfect Ride</Text>
          <Text className="text-blue-100 text-base mt-2">
            Choose from our wide selection of quality vehicles
          </Text>
        </View>

        <View className="bg-white px-4 py-5 shadow">
          <Text className="text-base font-semibold text-gray-800 mb-3">Search Filters</Text>
          <View className="gap-3">
            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <Picker
                selectedValue={filters.location}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <Picker.Item label="Select Location" value="" />
                <Picker.Item label="Colombo" value="Colombo" />
                <Picker.Item label="Kandy" value="Kandy" />
                <Picker.Item label="Galle" value="Galle" />
                <Picker.Item label="Negombo" value="Negombo" />
                <Picker.Item label="Jaffna" value="Jaffna" />
                <Picker.Item label="Matara" value="Matara" />
              </Picker>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white justify-center"
              >
                <Text className="text-gray-700 font-medium">
                  {filters.startDate ? filters.startDate : 'Start date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white justify-center"
              >
                <Text className="text-gray-700 font-medium">
                  {filters.endDate ? filters.endDate : 'End date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="bg-white px-4 py-5 border-t border-gray-100">
          <Text className="text-base font-semibold text-gray-800 mb-3">Advanced Filters</Text>
          <View className="gap-3">
            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <Picker
                selectedValue={filters.vehicleType}
                onValueChange={(value) => handleFilterChange('vehicleType', value)}
              >
                <Picker.Item label="Select Vehicle Type" value="" />
                <Picker.Item label="Car" value="Car" />
                <Picker.Item label="SUV" value="SUV" />
                <Picker.Item label="Van" value="Van" />
                <Picker.Item label="Truck" value="Truck" />
                <Picker.Item label="Sedan" value="Sedan" />
              </Picker>
            </View>

            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <Picker
                selectedValue={filters.transmission}
                onValueChange={(value) => handleFilterChange('transmission', value)}
              >
                <Picker.Item label="Select Transmission" value="" />
                <Picker.Item label="Manual" value="Manual" />
                <Picker.Item label="Automatic" value="Automatic" />
              </Picker>
            </View>

            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <Picker
                selectedValue={filters.fuelType}
                onValueChange={(value) => handleFilterChange('fuelType', value)}
              >
                <Picker.Item label="Select Fuel Type" value="" />
                <Picker.Item label="Petrol" value="Petrol" />
                <Picker.Item label="Diesel" value="Diesel" />
                <Picker.Item label="Hybrid" value="Hybrid" />
                <Picker.Item label="Electric" value="Electric" />
              </Picker>
            </View>

            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <View className="flex-row items-center justify-between px-4 py-3 gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const currentPrice = Number(filters.minPrice) || 0;
                    const newPrice = Math.max(0, currentPrice - 5000);
                    handleFilterChange('minPrice', String(newPrice));
                  }}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-xl font-bold text-[#0D3778]">−</Text>
                </TouchableOpacity>
                
                <TextInput
                  value={filters.minPrice}
                  onChangeText={(value) => {
                    const numValue = value.replace(/[^0-9]/g, '');
                    handleFilterChange('minPrice', numValue);
                  }}
                  placeholder="Min price (LKR/day)"
                  keyboardType="numeric"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />

                <TouchableOpacity
                  onPress={() => {
                    const currentPrice = Number(filters.minPrice) || 0;
                    const newPrice = currentPrice + 5000;
                    handleFilterChange('minPrice', String(newPrice));
                  }}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-xl font-bold text-[#0D3778]">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="border border-gray-300 rounded-lg overflow-hidden bg-white">
              <View className="flex-row items-center justify-between px-4 py-3 gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const currentPrice = Number(filters.maxPrice) || 0;
                    const newPrice = Math.max(0, currentPrice - 5000);
                    handleFilterChange('maxPrice', String(newPrice));
                  }}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-xl font-bold text-[#0D3778]">−</Text>
                </TouchableOpacity>
                
                <TextInput
                  value={filters.maxPrice}
                  onChangeText={(value) => {
                    const numValue = value.replace(/[^0-9]/g, '');
                    handleFilterChange('maxPrice', numValue);
                  }}
                  placeholder="Max price (LKR/day)"
                  keyboardType="numeric"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <TouchableOpacity
                  onPress={() => {
                    const currentPrice = Number(filters.maxPrice) || 0;
                    const newPrice = currentPrice + 5000;
                    handleFilterChange('maxPrice', String(newPrice));
                  }}
                  className="p-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-xl font-bold text-[#0D3778]">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            className="bg-[#0D3778] py-3 rounded-lg mt-4"
          >
            <Text className="text-white font-semibold text-center">Search</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 py-5">
          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#0D3778" />
              <Text className="mt-4 text-gray-700 font-semibold">Loading vehicles...</Text>
            </View>
          ) : filteredVehicles.length > 0 ? (
            <>
              <Text className="text-xl font-bold text-[#0D3778] mb-4">
                {filteredVehicles.length} Vehicle
                {filteredVehicles.length !== 1 ? 's' : ''} Available
              </Text>
              <FlatList
                data={filteredVehicles}
                keyExtractor={(item) => String(item._id || item.id)}
                renderItem={renderVehicleCard}
                scrollEnabled={false}
              />
            </>
          ) : (
            <View className="items-center py-12 bg-white rounded-2xl border border-gray-100">
              <Text className="text-5xl">🚗</Text>
              <Text className="text-xl font-bold text-[#0D3778] mt-4">No Vehicles Available</Text>
              <Text className="text-gray-600 text-center mt-2 mb-6 px-6">
                For your search. Try adjusting filters or check back later.
              </Text>
              <TouchableOpacity
                onPress={fetchVehicles}
                className="bg-[#0D3778] px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Date Picker Modal */}
      <Modal visible={showStartDatePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Select Start Date</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                <Text className="text-blue-600 font-semibold text-base">Done</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={(day) => handleStartDateChange(day.dateString)}
              markedDates={{
                [filters.startDate]: { selected: true, selectedColor: '#0D3778' },
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#666666',
                textSectionTitleDisabledColor: '#d9d9d9',
                selectedDayBackgroundColor: '#0D3778',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#0D3778',
                dayTextColor: '#2d3436',
                textDisabledColor: '#d9d9d9',
                dotColor: '#0D3778',
                selectedDotColor: '#ffffff',
                arrowColor: '#0D3778',
                disabledArrowColor: '#d9d9d9',
                monthTextColor: '#2d3436',
                indicatorColor: '#0D3778',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal visible={showEndDatePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Select End Date</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <Text className="text-blue-600 font-semibold text-base">Done</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={(day) => handleEndDateChange(day.dateString)}
              markedDates={{
                [filters.endDate]: { selected: true, selectedColor: '#0D3778' },
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#666666',
                textSectionTitleDisabledColor: '#d9d9d9',
                selectedDayBackgroundColor: '#0D3778',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#0D3778',
                dayTextColor: '#2d3436',
                textDisabledColor: '#d9d9d9',
                dotColor: '#0D3778',
                selectedDotColor: '#ffffff',
                arrowColor: '#0D3778',
                disabledArrowColor: '#d9d9d9',
                monthTextColor: '#2d3436',
                indicatorColor: '#0D3778',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-center px-4">
          <View className="bg-white rounded-2xl overflow-hidden max-h-[90%]">
            <View className="relative h-56 bg-gray-200">
              {selectedVehicle?.photos?.length ? (
                <Image
                  source={{ uri: selectedVehicle.photos[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-5xl">🚗</Text>
                  <Text className="text-base text-gray-600 mt-3">No Image Available</Text>
                </View>
              )}
              <Pressable
                onPress={closeModal}
                className="absolute top-3 right-3 bg-white/90 rounded-full p-2"
              >
                <X size={20} color="#4B5563" />
              </Pressable>
              <View className="absolute top-3 left-3 bg-white/95 rounded-lg px-3 py-1.5 flex-row items-center gap-1">
                <Star size={16} color="#FACC15" fill="#FACC15" />
                <Text className="text-sm font-bold text-gray-800">
                  {(selectedRating ?? 0).toFixed(1)}
                </Text>
                {selectedReviewCount > 0 && (
                  <Text className="text-xs text-gray-600">({selectedReviewCount})</Text>
                )}
              </View>
            </View>

            <ScrollView className="p-4">
              <View className="mb-4">
                <Text className="text-2xl font-bold text-gray-900">
                  {selectedVehicle?.title || 'Vehicle'}
                </Text>
                <Text className="text-gray-600 mt-1">
                  {selectedVehicle?.year || 'N/A'} • {selectedVehicle?.vehicleType || 'N/A'}
                </Text>
              </View>

              <View className="flex-row items-start gap-2 mb-4 bg-red-50 p-3 rounded-xl">
                <MapPin size={18} color="#EF4444" />
                <View>
                  <Text className="text-xs text-gray-600 font-medium">Location</Text>
                  <Text className="text-base text-gray-900">
                    {selectedVehicle?.location?.address || selectedVehicle?.address || 'Location not specified'}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <Info size={18} color="#0D3778" />
                  <Text className="text-lg font-bold text-gray-900">Specifications</Text>
                </View>
                <View className="gap-3">
                  <View className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex-row items-center gap-3">
                    <Fuel size={20} color="#2563EB" />
                    <View>
                      <Text className="text-xs text-gray-600 font-medium">Fuel Type</Text>
                      <Text className="text-base font-bold text-gray-900">
                        {selectedVehicle?.fuelType || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex-row items-center gap-3">
                    <Zap size={20} color="#7C3AED" />
                    <View>
                      <Text className="text-xs text-gray-600 font-medium">Transmission</Text>
                      <Text className="text-base font-bold text-gray-900">
                        {selectedVehicle?.transmission || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-green-50 rounded-xl p-3 border border-green-100 flex-row items-center gap-3">
                    <Users size={20} color="#16A34A" />
                    <View>
                      <Text className="text-xs text-gray-600 font-medium">Capacity</Text>
                      <Text className="text-base font-bold text-gray-900">
                        {selectedVehicle?.capacity || 'N/A'} Seats
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {selectedVehicle?.description ? (
                <View className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <Text className="text-base font-bold text-gray-900 mb-1">Description</Text>
                  <Text className="text-gray-700">{selectedVehicle.description}</Text>
                </View>
              ) : null}

              <View className="mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <DollarSign size={18} color="#0D3778" />
                  <Text className="text-lg font-bold text-gray-900">Pricing Details</Text>
                </View>
                <View className="gap-3">
                  <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-xs text-gray-600 font-medium">Per Day Rate</Text>
                      <Calendar size={16} color="#0D3778" />
                    </View>
                    <Text className="text-2xl font-bold text-[#0D3778]">
                      {formatPrice(selectedVehicle?.pricePerDay)}
                      <Text className="text-base text-gray-600"> LKR</Text>
                    </Text>
                  </View>

                  <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-xs text-gray-600 font-medium">Per KM Rate</Text>
                      <MapPin size={16} color="#6B7280" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedVehicle?.pricePerKm)}
                      <Text className="text-base text-gray-600"> LKR</Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 pb-4">
                <TouchableOpacity
                  onPress={closeModal}
                  className="flex-1 bg-gray-100 py-3 rounded-xl"
                >
                  <Text className="text-gray-700 font-semibold text-center">Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    closeModal();
                    const id = selectedVehicle?._id || selectedVehicle?.id;
                    router.push(`/vehicle/${id}/book`);
                  }}
                  className="flex-1 bg-[#0D3778] py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold text-center">Book Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
