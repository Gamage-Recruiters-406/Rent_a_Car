//owner/AvailabilityOwner - owner side
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  getVehicleAvailability,
  createOwnerPersonalUseBooking,
} from '../../services/bookingAvailability';

const AvailabilityOwner = ({ isOpen, onClose, vehicle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    start: null,
    end: null,
  });

  console.log('AvailabilityOwner - isOpen:', isOpen);
  console.log('AvailabilityOwner - vehicle:', vehicle?._id);

  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    [],
  );

  const daysOfWeek = useMemo(
    () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    [],
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    const firstDow = firstDay.getDay();
    for (let i = 0; i < firstDow; i++) {
      const prev = new Date(year, month, -firstDow + i + 1);
      days.push({
        date: prev.getDate(),
        isCurrentMonth: false,
        fullDate: prev,
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      days.push({
        date: next.getDate(),
        isCurrentMonth: false,
        fullDate: next,
      });
    }

    return days;
  };

  const fetchAvailability = useCallback(async () => {
    if (!vehicle?._id) {
      console.log('No vehicle ID provided');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching availability for vehicle:', vehicle._id);
      const res = await getVehicleAvailability(vehicle._id);
      console.log('Availability response:', res);

      const bookingsArr = res?.data || [];
      const newBookedDates = {};

      bookingsArr.forEach((b) => {
        if (['rejected', 'cancelled'].includes(b.status)) return;

        const startRaw = b.startingDate ?? b.startDate ?? b.from ?? b.start;
        const endRaw = b.endDate ?? b.to ?? b.end;

        if (!startRaw || !endRaw) return;

        const start = new Date(startRaw);
        const end = new Date(endRaw);

        let cur = new Date(start);
        while (cur <= end) {
          newBookedDates[formatDateISO(cur)] = 'booked';
          cur.setDate(cur.getDate() + 1);
        }
      });

      console.log('Booked dates:', Object.keys(newBookedDates).length);
      setBookedDates(newBookedDates);
    } catch (e) {
      console.error('fetchAvailability error:', e);
      Alert.alert('Error', 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [vehicle?._id]); 

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching availability...');
      fetchAvailability();
      setSelectionRange({ start: null, end: null });
    }
  }, [isOpen, fetchAvailability]); //  fetchAvailability to dependencies

  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day.fullDate < today) return;

    const dateStr = formatDateISO(day.fullDate);
    if (bookedDates[dateStr] === 'booked') return;

    if (!selectionRange.start || (selectionRange.start && selectionRange.end)) {
      setSelectionRange({ start: day.fullDate, end: null });
    } else {
      if (day.fullDate < selectionRange.start) {
        setSelectionRange({ start: day.fullDate, end: selectionRange.start });
      } else {
        setSelectionRange({ ...selectionRange, end: day.fullDate });
      }
    }
  };

  const isDateSelected = (date) => {
    if (!selectionRange.start) return false;
    if (selectionRange.end) {
      return date >= selectionRange.start && date <= selectionRange.end;
    }
    return date.getTime() === selectionRange.start.getTime();
  };

  const handleBlockDates = async () => {
    if (!selectionRange.start || !selectionRange.end) return;

    let cur = new Date(selectionRange.start);
    while (cur <= selectionRange.end) {
      if (bookedDates[formatDateISO(cur)] === 'booked') {
        Alert.alert('Error', 'One or more dates in range are already booked');
        return;
      }
      cur.setDate(cur.getDate() + 1);
    }

    try {
      setLoading(true);

      const endDateTime = new Date(selectionRange.end);
      endDateTime.setHours(23, 59, 59, 999);

      await createOwnerPersonalUseBooking({
        vehicleId: vehicle._id,
        startingDate: selectionRange.start,
        endDate: endDateTime,
      });

      Alert.alert('Success', 'Dates blocked successfully');
      setSelectionRange({ start: null, end: null });
      await fetchAvailability();
    } catch (error) {
      console.error('Block dates error:', error);
      Alert.alert('Error', error.message || 'Failed to block dates');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const days = getDaysInMonthGrid(currentDate);

  const selectedCount =
    selectionRange.start && selectionRange.end
      ? Math.round(
          (selectionRange.end - selectionRange.start) / (1000 * 60 * 60 * 24),
        ) + 1
      : 0;

  const getDayStyles = (day) => {
    const dateStr = formatDateISO(day.fullDate);
    const isBooked = bookedDates[dateStr] === 'booked';
    const isSelected = isDateSelected(day.fullDate);
    const isCurrentMonth = day.isCurrentMonth;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = day.fullDate < today;

    if (!isCurrentMonth) {
      return {
        containerClass: 'bg-transparent',
        textClass: 'text-gray-300',
        isDisabled: true,
      };
    } else if (isBooked) {
      return {
        containerClass: 'bg-red-100',
        textClass: 'text-red-600',
        isDisabled: true,
      };
    } else if (isSelected) {
      return {
        containerClass: 'bg-blue-500',
        textClass: 'text-white font-bold',
        isDisabled: false,
      };
    } else if (isPast) {
      return {
        containerClass: 'bg-gray-100',
        textClass: 'text-gray-400',
        isDisabled: true,
      };
    } else {
      return {
        containerClass: 'bg-green-100',
        textClass: 'text-green-700',
        isDisabled: false,
      };
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black/50">
        <View className="flex-1 justify-center items-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <View className="bg-white p-4 border-b border-gray-200 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="bg-blue-100 p-2 rounded-lg mr-2">
                  <Text className="text-blue-600 text-xl">📅</Text>
                </View>
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    {vehicle?.title || 'Vehicle Availability'}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {vehicle?.model || ''} {vehicle?.year || ''}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-gray-100 rounded-full"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-gray-600 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {/* Navigation */}
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  className="p-2 rounded-full border border-gray-300"
                  disabled={loading}
                >
                  <Text className="text-gray-600 text-lg">←</Text>
                </TouchableOpacity>

                <Text className="text-base font-bold text-gray-800">
                  {months[currentMonth]} {currentYear}
                </Text>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  className="p-2 rounded-full border border-gray-300"
                  disabled={loading}
                >
                  <Text className="text-gray-600 text-lg">→</Text>
                </TouchableOpacity>
              </View>

              {/* Calendar Grid */}
              <View className="mb-4">
                <View className="flex-row mb-2">
                  {daysOfWeek.map((day) => (
                    <View key={day} className="flex-1 items-center">
                      <Text className="text-xs font-semibold text-gray-500">
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row flex-wrap">
                  {days.map((day, idx) => {
                    const styles = getDayStyles(day);

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleDateClick(day)}
                        disabled={styles.isDisabled || loading}
                        className={`w-[14.28%] aspect-square rounded-lg justify-center items-center m-[1px] ${styles.containerClass}`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-sm font-medium ${styles.textClass}`}
                        >
                          {day.date}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Legend */}
              <View className="flex-row items-center justify-around py-3 border-t border-gray-200">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-100 mr-1" />
                  <Text className="text-xs text-gray-600">Available</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-red-100 mr-1" />
                  <Text className="text-xs text-gray-600">Blocked</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-blue-500 mr-1" />
                  <Text className="text-xs text-gray-600">Selected</Text>
                </View>
              </View>

              {/* Footer */}
              <View className="mt-4">
                <TouchableOpacity
                  onPress={handleBlockDates}
                  disabled={
                    !selectionRange.start || !selectionRange.end || loading
                  }
                  className={`w-full py-3 px-4 rounded-xl flex-row items-center justify-center
                    ${
                      !selectionRange.start || !selectionRange.end || loading
                        ? 'bg-gray-300'
                        : 'bg-blue-600'
                    }`}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="font-bold text-white ml-2">
                        Processing...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text className="font-bold text-white">
                        Block Selected Range
                      </Text>
                      {selectedCount > 0 && (
                        <View className="bg-white/30 px-2 py-0.5 rounded ml-2">
                          <Text className="text-white text-xs font-bold">
                            {selectedCount}{' '}
                            {selectedCount === 1 ? 'day' : 'days'}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>

                <Text className="text-center text-xs text-gray-400 mt-2">
                  {Object.keys(bookedDates).length} days currently blocked
                </Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default AvailabilityOwner;