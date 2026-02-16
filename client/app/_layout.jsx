import { Stack } from 'expo-router';
import "../global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="owner/rental-history"
        options={{
          title: "Rental History",
          headerStyle: {
            backgroundColor: "#1e40af",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="owner/rental-details"
        options={{
          presentation: "modal",
          title: "Rental Details",
          headerStyle: {
            backgroundColor: "#1e40af",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
    </Stack>
  );
}
