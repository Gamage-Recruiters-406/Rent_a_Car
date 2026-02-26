import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { isSmallScreen } from "../../constants/screenSize";

/**
 * StarRating
 * Props:
 *   rating  {number}  — integer 1–5
 */
export default function StarRating({ rating }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={isSmallScreen ? 12 : 14}
          color={i < rating ? "#F59E0B" : "#D1D5DB"}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}