// components/Avatar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AvatarProps {
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const Avatar = ({ 
  size = 32, 
  backgroundColor = '#f97316', 
  textColor = 'white' 
}: AvatarProps) => {
  // You can replace 'B' with user's initials or first letter of name
  // For now, we'll use 'B' for Bazario
  const initials = 'B';
  
  return (
    <View style={[
      styles.avatar, 
      { 
        width: size, 
        height: size, 
        backgroundColor, 
        borderRadius: size / 2 
      }
    ]}>
      <Text style={[styles.initials, { color: textColor, fontSize: size * 0.5 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: 'bold',
  },
});