// app/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
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