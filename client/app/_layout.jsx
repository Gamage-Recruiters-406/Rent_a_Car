import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main navigation */}
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />

      {/* Owner routes */}
      <Stack.Screen name="owner/owner-dashboard" />
      <Stack.Screen name="owner/rental-history" />
      <Stack.Screen name="owner/AddVehicle" />
      <Stack.Screen name="owner/AvailabilityOwner" />
      <Stack.Screen name="owner/my-vehicle" />
      <Stack.Screen name="owner/rental-details" />

      {/* Customer profile pages */}
      <Stack.Screen name="profilepages/CustomerProfileEdit" />
      <Stack.Screen name="profilepages/OwnerProfileEdit" />

      {/* Customer vehicle routes */}
      <Stack.Screen name="CustomerVehicleList/index" />
      <Stack.Screen name="vehicle_booking/index" />

      {/* Booking history */}
      <Stack.Screen name="Cus_booking-history/booking-history" />

      {/* Reviews */}
      <Stack.Screen name="MyReviews" />
      <Stack.Screen name="Reviews" />

      {/* Notifications */}
      <Stack.Screen name="Notifications/index" />

      {/* Vehicle details */}
      <Stack.Screen name="vehicle/index" />
    </Stack>
  );
}
