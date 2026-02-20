
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export function AnalogTimePicker({ selectedTime, onSelect, onClose }) {
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
