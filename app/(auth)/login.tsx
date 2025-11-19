import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import BazarioLogo from '../../assets/images/BazarioLogo.png';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@bazario.com');
  const [password, setPassword] = useState('12345');
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing credentials', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }

    router.replace('/');
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Missing information', 'Please enter an email and password to register.');
      return;
    }

    setRegistering(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setRegistering(false);

    if (error) {
      Alert.alert('Registration failed', error.message);
      return;
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Image source={BazarioLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to continue to Bazario</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputShell}>
              <Ionicons name="mail-outline" color="#94a3b8" size={18} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" color="#94a3b8" size={18} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="********"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.registerButton, registering && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={registering}
          >
            <Text style={styles.buttonText}>{registering ? 'Registering...' : 'Create Account'}</Text>
          </TouchableOpacity>
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
    padding: 24,
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
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButton: {
    backgroundColor: '#10b981',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
