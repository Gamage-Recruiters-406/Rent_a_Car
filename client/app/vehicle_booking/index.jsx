
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    ImageBackground,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Modal,
    FlatList,
    Alert
} from 'react-native';
import {
    Calendar,
    Clock,
    Car,
    Star,
    Quote,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from './BookingPageHeader';
import { searchVehicles, createBooking } from '../../services/bookingApi';
import { getAllReviews } from '../../services/reviewApi';

// Helper for NativeWind classes
const className = (...classes) => classes.filter(Boolean).join(' ');

// --- AnalogTimePicker Component ---
function AnalogTimePicker({ selectedTime, onSelect, onClose }) {
    const [mode, setMode] = useState('hour');
    const [hour, setHour] = useState(selectedTime?.hour || 12);
    const [minute, setMinute] = useState(selectedTime?.minute || 0);
    const [period, setPeriod] = useState(selectedTime?.period || 'AM');

    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    const getPosition = (index, total, radius) => {
        const angle = (index * (360 / total) - 90) * (Math.PI / 180);
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    };

    const getHandRotation = () => {
        if (mode === 'hour') {
            const hourIndex = hours.indexOf(hour);
            return hourIndex * 30 - 90;
        } else {
            const minuteIndex = minutes.indexOf(minute);
            return minuteIndex * 30 - 90;
        }
    };

    const handleHourClick = (h) => {
        setHour(h);
        setTimeout(() => setMode('minute'), 300);
    };

    const handleMinuteClick = (m) => {
        setMinute(m);
    };

    const handleConfirm = () => {
        onSelect({ hour, minute, period });
        onClose();
    };

    return (
        <Modal transparent animationType="fade" visible={true} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-xl p-4 w-80 shadow-lg">
                    {/* Header */}
                    <View className="bg-[#1e3a5f] rounded-lg p-4 mb-4 items-center">
                        <View className="flex-row items-end">
                            <TouchableOpacity onPress={() => setMode('hour')}>
                                <Text className={`text-4xl font-bold ${mode === 'hour' ? 'text-white' : 'text-white/60'}`}>
                                    {hour.toString().padStart(2, '0')}
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-4xl font-bold text-white mx-1">:</Text>
                            <TouchableOpacity onPress={() => setMode('minute')}>
                                <Text className={`text-4xl font-bold ${mode === 'minute' ? 'text-white' : 'text-white/60'}`}>
                                    {minute.toString().padStart(2, '0')}
                                </Text>
                            </TouchableOpacity>
                            <View className="ml-2">
                                <TouchableOpacity onPress={() => setPeriod('AM')} className={`px-2 py-1 rounded ${period === 'AM' ? 'bg-white/20' : ''}`}>
                                    <Text className={`font-bold ${period === 'AM' ? 'text-white' : 'text-white/60'}`}>AM</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setPeriod('PM')} className={`px-2 py-1 rounded mt-1 ${period === 'PM' ? 'bg-white/20' : ''}`}>
                                    <Text className={`font-bold ${period === 'PM' ? 'text-white' : 'text-white/60'}`}>PM</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text className="text-blue-200 text-xs mt-2">{mode === 'hour' ? 'Select hour' : 'Select minute'}</Text>
                    </View>

                    {/* Clock Face */}
                    <View className="items-center mb-6">
                        <View className="w-64 h-64 rounded-full bg-gray-50 border-2 border-gray-200 relative justify-center items-center">
                            {/* Center Dot */}
                            <View className="w-2 h-2 bg-[#1e3a5f] rounded-full absolute z-10" />

                            {/* Hand */}
                            <View
                                className="h-1 bg-[#2563eb] absolute left-1/2 origin-left z-0"
                                style={{
                                    width: mode === 'hour' ? 80 : 100,
                                    transform: [
                                        { translateY: -2 }, // Half height to center vertically
                                        { rotate: `${getHandRotation()}deg` },
                                        { translateX: 0 } // Pivot from left
                                    ]
                                }}
                            >
                                <View className="w-8 h-8 bg-[#2563eb]/20 rounded-full absolute -right-4 -top-3.5" />
                            </View>

                            {/* Numbers */}
                            {mode === 'hour' ? hours.map((h, i) => {
                                const pos = getPosition(i, 12, 100);
                                return (
                                    <TouchableOpacity
                                        key={h}
                                        onPress={() => handleHourClick(h)}
                                        className={`absolute w-10 h-10 rounded-full justify-center items-center ${hour === h ? 'bg-[#2563eb]' : ''}`}
                                        style={{
                                            left: 128 + pos.x - 20, // Center (128) + x - radius(20)
                                            top: 128 + pos.y - 20
                                        }}
                                    >
                                        <Text className={`font-semibold ${hour === h ? 'text-white' : 'text-gray-700'}`}>{h}</Text>
                                    </TouchableOpacity>
                                );
                            }) : minutes.map((m, i) => {
                                const pos = getPosition(i, 12, 100);
                                return (
                                    <TouchableOpacity
                                        key={m}
                                        onPress={() => handleMinuteClick(m)}
                                        className={`absolute w-10 h-10 rounded-full justify-center items-center ${minute === m ? 'bg-[#2563eb]' : ''}`}
                                        style={{
                                            left: 128 + pos.x - 20,
                                            top: 128 + pos.y - 20
                                        }}
                                    >
                                        <Text className={`font-semibold ${minute === m ? 'text-white' : 'text-gray-700'}`}>{m.toString().padStart(2, '0')}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <Text className="text-gray-500">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} className="bg-[#2563eb] px-6 py-2 rounded-lg">
                            <Text className="text-white font-bold">OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// --- DatePicker Component ---
function DatePicker({ selectedDate, onSelect, onClose }) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
    };

    return (
        <Modal transparent animationType="fade" visible={true} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-xl p-4 w-80 shadow-lg">
                    <View className="flex-row justify-between items-center mb-4">
                        <TouchableOpacity onPress={prevMonth} className="p-2">
                            <ChevronLeft size={24} color="#4b5563" />
                        </TouchableOpacity>
                        <Text className="font-bold text-gray-800 text-lg">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={nextMonth} className="p-2">
                            <ChevronRight size={24} color="#4b5563" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        {dayNames.map(day => (
                            <Text key={day} className="w-8 text-center text-gray-500 font-medium">{day}</Text>
                        ))}
                    </View>

                    <View className="flex-row flex-wrap">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <View key={`empty-${i}`} className="w-10 h-10" /> // Approximate width for 320px width (80-padding) / 7
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            return (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => {
                                        onSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                                        onClose();
                                    }}
                                    className={`w-10 h-10 justify-center items-center rounded-full mb-1 ${isSelected(day) ? 'bg-[#1e3a5f]' : isToday(day) ? 'bg-blue-100' : ''
                                        }`}
                                >
                                    <Text className={`${isSelected(day) ? 'text-white' : isToday(day) ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity onPress={onClose} className="mt-4 self-center">
                        <Text className="text-gray-500">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}


// --- Main Page Component ---
export default function VehicleBookingPage() {
    const router = useRouter();
    const [pickupDate, setPickupDate] = useState(null);
    const [pickupTime, setPickupTime] = useState(null);
    const [dropoffDate, setDropoffDate] = useState(null);
    const [dropoffTime, setDropoffTime] = useState(null);

    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null); // Helper to show clean name
    const [isLoading, setIsLoading] = useState(false);
    const [reviews, setReviews] = useState([]);

    const [showPickupCalendar, setShowPickupCalendar] = useState(false);
    const [showPickupTime, setShowPickupTime] = useState(false);
    const [showDropoffCalendar, setShowDropoffCalendar] = useState(false);
    const [showDropoffTime, setShowDropoffTime] = useState(false);
    const [showVehiclePicker, setShowVehiclePicker] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await searchVehicles({});
                // Adjust based on your API response structure
                const data = res.data || (res.success && res.data) || [];
                setVehicles(data);
                if (data.length > 0) {
                    setSelectedVehicleId(data[0]._id);
                    setSelectedVehicle(data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch vehicles", error);
            }
        };
        fetchVehicles();

        const fetchReviews = async () => {
            try {
                const response = await getAllReviews();
                let fetchedReviews = [];
                if (Array.isArray(response)) {
                    fetchedReviews = response;
                } else if (response?.reviews) {
                    fetchedReviews = response.reviews;
                } else if (response?.data) {
                    fetchedReviews = response.data;
                }
                setReviews(fetchedReviews);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        };
        fetchReviews();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'MM/DD/YYYY';
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatTime = (time) => {
        if (!time) return '12:00 AM';
        return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.period}`;
    };

    const combineDateTime = (date, time) => {
        if (!date) return null;
        const t = time || { hour: 12, minute: 0, period: 'AM' };
        const d = new Date(date);
        let hours = t.hour;
        if (t.period === 'PM' && hours < 12) hours += 12;
        if (t.period === 'AM' && hours === 12) hours = 0;
        d.setHours(hours, t.minute, 0, 0);
        return d;
    };

    const getEstimatedTotal = () => {
        const vehicle = vehicles.find(v => v._id === selectedVehicleId);
        if (!vehicle || !pickupDate || !dropoffDate) return "0.00";
        const start = combineDateTime(pickupDate, pickupTime);
        const end = combineDateTime(dropoffDate, dropoffTime);
        if (!start || !end || end <= start) return "0.00";

        const diffMs = end.getTime() - start.getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        const days = Math.max(1, Math.ceil(diffMs / dayMs));
        const rate = vehicle.amount || vehicle.pricePerDay || 0;
        return (days * rate).toFixed(2);
    };

    const handleBookingCreate = async () => {
        if (!selectedVehicleId) return Alert.alert("Error", "Please select a vehicle.");
        const start = combineDateTime(pickupDate, pickupTime);
        const end = combineDateTime(dropoffDate, dropoffTime);

        if (!start || !end) return Alert.alert("Error", "Please select pickup and dropoff dates.");
        if (end <= start) return Alert.alert("Error", "End date must be after pickup date.");

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('vehicleId', selectedVehicleId);
            formData.append('startingDate', start.toISOString());
            formData.append('endDate', end.toISOString());

            await createBooking(formData); // Assuming createBooking handles the fetch
            Alert.alert("Success", "Booking request sent successfully!");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to create booking.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <Header onNavigate={(route) => console.log('Navigate', route)} />

            {/* Hero Section */}
            <View className="h-[600px] relative bg-gray-900">
                <ImageBackground
                    source={{ uri: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80" }}
                    className="flex-1 justify-center"
                    imageStyle={{ opacity: 0.6 }}
                >
                    <View className="absolute inset-0 bg-black/40" /> {/* Grading overlay if needed */}

                    <View className="px-4 py-8 items-center">
                        {/* Form Card */}
                        <View className="w-full max-w-sm bg-[#1e3a5f]/90 p-6 rounded-xl border border-white/10 mb-8">
                            <Text className="text-blue-200 text-sm font-semibold mb-6 uppercase tracking-wider">Continue Car Reservation</Text>

                            {/* Vehicle Selector */}
                            <TouchableOpacity
                                onPress={() => setShowVehiclePicker(true)}
                                className="bg-white rounded-md flex-row items-center justify-between px-3 py-3 mb-4"
                            >
                                <Text className="text-gray-900 font-medium">
                                    {selectedVehicle ?
                                        `${selectedVehicle.title || selectedVehicle.make} [${selectedVehicle.licensePlate || 'NA'}]`
                                        : "Select a vehicle"}
                                </Text>
                                <Car size={20} color="#6b7280" />
                            </TouchableOpacity>

                            {/* Pick Up */}
                            <View className="mb-4">
                                <View className="bg-gray-200 rounded px-3 py-2 flex-row items-center mb-1">
                                    <Calendar size={12} color="#4b5563" />
                                    <Text className="text-gray-600 text-xs font-medium ml-1">Pick Up</Text>
                                </View>
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => setShowPickupCalendar(true)}
                                        className="flex-1 bg-white rounded px-3 py-2 items-center"
                                    >
                                        <Text className="text-gray-900 text-xs">{formatDate(pickupDate)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setShowPickupTime(true)}
                                        className="flex-1 bg-white rounded px-3 py-2 flex-row justify-between items-center"
                                    >
                                        <Text className="text-gray-900 text-xs truncate">{formatTime(pickupTime)}</Text>
                                        <Clock size={12} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Drop Off */}
                            <View className="mb-6">
                                <View className="bg-gray-200 rounded px-3 py-2 flex-row items-center mb-1">
                                    <Calendar size={12} color="#4b5563" />
                                    <Text className="text-gray-600 text-xs font-medium ml-1">Drop Off</Text>
                                </View>
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => setShowDropoffCalendar(true)}
                                        className="flex-1 bg-white rounded px-3 py-2 items-center"
                                    >
                                        <Text className="text-gray-900 text-xs">{formatDate(dropoffDate)}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setShowDropoffTime(true)}
                                        className="flex-1 bg-white rounded px-3 py-2 flex-row justify-between items-center"
                                    >
                                        <Text className="text-gray-900 text-xs truncate">{formatTime(dropoffTime)}</Text>
                                        <Clock size={12} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Total */}
                            <View className="bg-white rounded px-4 py-3 flex-row justify-between items-center mb-4">
                                <Text className="text-gray-900 font-bold text-sm">Trip total:</Text>
                                <Text className="text-gray-900 font-bold text-sm">LKR {getEstimatedTotal()}</Text>
                            </View>

                            {/* Button */}
                            <TouchableOpacity
                                onPress={handleBookingCreate}
                                disabled={isLoading}
                                className={`w-full py-3 bg-[#162c46] rounded items-center ${isLoading ? 'opacity-50' : ''}`}
                            >
                                <Text className="text-white font-bold">{isLoading ? 'Processing...' : 'Book Now'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Process Section */}
            <View className="py-12 bg-white px-4">
                <View className="items-center mb-10">
                    <Text className="text-2xl font-bold text-[#1e3a5f] text-center mb-2">RentmyCar Renting Process</Text>
                    <Text className="text-[#1e3a5f]/70 text-center">To get a Car, RentmyCar has simple process to go ahead.</Text>
                </View>

                <View className="space-y-12">
                    <ProcessStep number="01" title="Come In Contact" desc="Come to our Location or Contact RentmyCar" />
                    <ProcessStep number="02" title="Choose A Car" desc="Select your Car from Various models" />
                    <ProcessStep number="03" title="Enjoy Driving" desc="Enjoy your Driving" />
                </View>
            </View>

            {/* Testimonials */}
            <View className="bg-gray-900 py-12 px-4">
                <Text className="text-white text-2xl font-bold text-center mb-4">Our Clients Reviews</Text>
                <Text className="text-gray-300 text-sm text-center mb-8">Hear from our satisfied clients!</Text>

                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                    {reviews.length > 0 ? reviews.map((review, index) => (
                        <View key={index} style={{ width: Dimensions.get('window').width - 32, marginRight: 0 }} className="mr-8">
                            <View className="bg-white rounded-lg p-6 mx-2">
                                <View className="flex-row items-center mb-4">
                                    <Image
                                        source={{ uri: review.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" }}
                                        className="w-12 h-12 rounded-full border-2 border-[#1e3a5f]"
                                    />
                                    <View className="ml-4">
                                        <Text className="font-bold text-[#1e3a5f]">{review.name || "Customer"}</Text>
                                        <Text className="text-xs text-gray-500">{review.profession || "Verified"}</Text>
                                        <View className="flex-row mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} color={i < review.rating ? "#b91c1c" : "#d1d5db"} fill={i < review.rating ? "#b91c1c" : "transparent"} />
                                            ))}
                                        </View>
                                    </View>
                                </View>
                                <Text className="text-gray-600 text-xs italic">"{review.quote || review.feedback}"</Text>
                            </View>
                        </View>
                    )) : (
                        <View style={{ width: Dimensions.get('window').width - 32 }} className="items-center py-4">
                            <Text className="text-gray-400">No reviews available</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Modals */}
            {showPickupCalendar && <DatePicker selectedDate={pickupDate} onSelect={setPickupDate} onClose={() => setShowPickupCalendar(false)} />}
            {showDropoffCalendar && <DatePicker selectedDate={dropoffDate} onSelect={setDropoffDate} onClose={() => setShowDropoffCalendar(false)} />}
            {showPickupTime && <AnalogTimePicker selectedTime={pickupTime} onSelect={setPickupTime} onClose={() => setShowPickupTime(false)} />}
            {showDropoffTime && <AnalogTimePicker selectedTime={dropoffTime} onSelect={setDropoffTime} onClose={() => setShowDropoffTime(false)} />}

            <Modal visible={showVehiclePicker} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl max-h-[50%] p-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="font-bold text-lg text-gray-800">Select Vehicle</Text>
                            <TouchableOpacity onPress={() => setShowVehiclePicker(false)}>
                                <X size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={vehicles}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-3 border-b border-gray-100 ${selectedVehicleId === item._id ? 'bg-blue-50' : ''}`}
                                    onPress={() => {
                                        setSelectedVehicleId(item._id);
                                        setSelectedVehicle(item);
                                        setShowVehiclePicker(false);
                                    }}
                                >
                                    <Text className="font-medium text-gray-800">{item.title || item.make} - {item.model}</Text>
                                    <Text className="text-xs text-gray-500">{item.licensePlate} • LKR {item.amount || item.pricePerDay}/day</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

function ProcessStep({ number, title, desc }) {
    return (
        <View className="relative items-center">
            <View className="bg-[#1e3a5f] w-64 p-6 rounded-lg items-center z-10">
                <Text className="text-white text-xl font-bold mb-2">{title}</Text>
                <Text className="text-blue-200 text-xs text-center">{desc}</Text>
            </View>
            <View className="absolute -bottom-6 w-12 h-12 bg-[#1a1a2e] rounded-full justify-center items-center border-4 border-white z-20">
                <Text className="text-white font-bold">{number}</Text>
            </View>
        </View>
    );
}
