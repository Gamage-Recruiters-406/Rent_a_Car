import React from "react";
import { View, Text } from "react-native";
import { Calendar } from "react-native-calendars";

export default function MiniCalendar({ month, blockedSet }) {
  return (
    <View
      style={{
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <Calendar
        key={month} // forces update when month changes
        current={`${month}-01`}
        hideExtraDays
        renderHeader={() => null} // hide default header
        hideArrows
        enableSwipeMonths={false}
        theme={{
          textDayHeaderFontWeight: "800",
          textDayHeaderFontSize: 12,
          textSectionTitleColor: "#64748b",
        }}
        dayComponent={({ date, state }) => {
          if (!date) return null;

          // outside month
          if (state === "disabled") {
            return <View style={{ width: 44, height: 36, margin: 4 }} />;
          }

          const dayStr = date.dateString;
          const isBlocked = blockedSet?.has(dayStr);

          const bg = isBlocked ? "#fee2e2" : "#d1fae5";
          const border = isBlocked ? "#fca5a5" : "#6ee7b7";

          return (
            <View
              style={{
                width: 44,
                height: 36,
                margin: 4,
                borderRadius: 8,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "900",
                  color: "#0f172a",
                }}
              >
                {date.day}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
