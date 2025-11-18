// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView, StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Slot />
    </SafeAreaView>
  );
}