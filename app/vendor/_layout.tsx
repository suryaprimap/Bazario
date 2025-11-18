// app/vendor/_layout.tsx
import { Tabs, useRouter } from 'expo-router'; 
import { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getLanguage, setLanguage } from '../../lib/vendor-utils';
import { TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../components/ui/Avatar';
import { Logo } from '../../components/ui/Logo';

// Export the utility functions for use in tabs
export { getLanguage, setLanguage };

export default function VendorLayout() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/vendor/dashboard');
  }, [router]); // 
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          paddingTop: 4,
        },
        headerTitle: () => <Logo size="medium" />,
        headerLeft: () => (
          <View style={{ marginLeft: 16 }}>
            {/* You can add navigation menu here if needed */}
          </View>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16 }}>
            {/* Home button */}
            <TouchableOpacity onPress={() => router.push('/')} style={{ padding: 8 }}>
              <MaterialIcons name="home" size={24} color="#3b82f6" />
            </TouchableOpacity>
            {/* Avatar */}
            <Avatar size={36} backgroundColor="#f97316" textColor="white" />
          </View>
        ),
        headerStyle: {
          backgroundColor: 'white',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventori',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory-2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analitik',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="show-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Amaran',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}