import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '../../components/ui/Avatar';
import { Logo } from '../../components/ui/Logo';

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/sales');
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 4,
          paddingTop: 4,
        },
        // ✅ Custom header with logo and avatar
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
              <MaterialIcons name="home" size={24} color="#8b5cf6" />
            </TouchableOpacity>
            {/* Avatar */}
            <Avatar size={36} backgroundColor="#8b5cf6" textColor="white" />
          </View>
        ),
        headerStyle: {
          backgroundColor: 'white',
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        sceneStyle: { backgroundColor: '#f4f6fb' },
      }}
    >
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Sales',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="point-of-sale" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="stacked-line-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="space-dashboard" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
