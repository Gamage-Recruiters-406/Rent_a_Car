
import React from 'react';
import { View, Text } from 'react-native';

export function ProcessStep({ number, title, desc }) {
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
