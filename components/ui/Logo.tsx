// components/Logo.tsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const Logo = ({ size = 'medium', style }: LogoProps) => {
  // Set logo size based on prop
  const logoSize = size === 'small' ? 24 : size === 'large' ? 40 : 32;
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../assets/images/BazarioLogo.png')} // ✅ Path to your logo
        style={[styles.logo, { width: logoSize, height: logoSize }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Logo will maintain aspect ratio
  },
});