// app/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);

    if (error) {
      Alert.alert('Logout failed', error.message);
      return;
    }

    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoutRow}>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          style={[styles.logoutIcon, loggingOut && styles.logoutIconDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Bazario</Text>
        <Text style={styles.subtitle}>Choose your view</Text>

        <Link href="/vendor/dashboard" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Vendor Dashboard</Text>
            <Text style={styles.buttonSubtitle}>For night market vendors</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity 
          style={[styles.adminButton]}
          onPress={() => router.push('/admin/analytics')}
        >
          <Text style={styles.buttonText}>Database Admin</Text>
          <Text style={styles.buttonSubtitle}>For system management</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
  },
  logoutRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logoutIcon: {
    padding: 8,
  },
  logoutIconDisabled: {
    opacity: 0.5,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  adminButton: {
    backgroundColor: '#22be8aff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    marginBottom: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
