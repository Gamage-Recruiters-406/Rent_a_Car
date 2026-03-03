import { Stack } from "expo-router";
import "../global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="owner/owner-dashboard"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="owner/rental-history"
        options={{
          title: "Rental History",
          headerStyle: {
            backgroundColor: "#0A2E5C",
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
            backgroundColor: "#0A2E5C",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack>
  );
}
