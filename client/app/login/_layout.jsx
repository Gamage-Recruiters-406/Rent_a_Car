import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="SignInPage" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="SignUpPage" options={{ title: 'Sign Up', headerShown: false }} />
    </Stack>
  );
}
