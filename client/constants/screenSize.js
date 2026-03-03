import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const isSmallScreen = width < 360;
export const isMediumScreen = width >= 360 && width < 414;
export const isTablet = width > 600;

export const horizontalPadding = isTablet ? 24 : isSmallScreen ? 12 : 16;