
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export function DatePicker({ selectedDate, onSelect, onClose }) {
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
