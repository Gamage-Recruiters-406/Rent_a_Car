import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="fogotindex" options={{ title: 'Forgot Password', headerShown: false }} />
      <Stack.Screen name="verify-code" options={{ title: 'Verify Code', headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ title: 'Reset Password', headerShown: false }} />
    </Stack>
  );
}
