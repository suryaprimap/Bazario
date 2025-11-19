// app/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import BazarioLogo from '../assets/images/BazarioLogo.png';

export default function HomeScreen() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (error) {
        setUserError(error.message);
        setUserEmail(null);
        return;
      }

      setUserEmail(data.user?.email ?? null);
      setUserError(null);
    };

    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 24;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.screenPadding, { paddingTop: topInset }]}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.profileArea}>
                {(userEmail || userError) && (
                  <Text style={styles.profileLabel}>
                    {userEmail ? `Logged in as ${userEmail}` : `Unable to load profile: ${userError}`}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleLogout}
                disabled={loggingOut}
                style={[styles.logoutIcon, loggingOut && styles.logoutIconDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <Ionicons name="log-out-outline" size={22} color="#dc2626" />
              </TouchableOpacity>
            </View>

            <Image source={BazarioLogo} style={styles.logo} resizeMode="contain" />
           
            <Text style={styles.subtitle}>Choose your view</Text>

            <View style={styles.actionColumn}>
              <Link href="/vendor/dashboard" asChild>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Vendor Dashboard</Text>
                  <Text style={styles.buttonSubtitle}>For night market vendors</Text>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity style={styles.button} onPress={() => router.push('/admin')}>
                <Text style={styles.buttonText}>Database Admin</Text>
                <Text style={styles.buttonSubtitle}>For system management</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  screenPadding: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileArea: {
    flex: 1,
    paddingRight: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'left',
  },
  logoutIcon: {
    padding: 10,
    backgroundColor: '#fff1f2',
    borderRadius: 12,
  },
  logoutIconDisabled: {
    opacity: 0.5,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 32,
    textAlign: 'center',
  },
  actionColumn: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
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
