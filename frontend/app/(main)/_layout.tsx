import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="lesson/[id]"
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
    </Stack>
  );
}
