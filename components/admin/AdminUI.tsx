import React, { ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type AdminScreenProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  contentPaddingBottom?: number;
};

export const AdminScreen = ({
  title,
  subtitle,
  actions,
  children,
  contentPaddingBottom = 80,
}: AdminScreenProps) => (
  <SafeAreaView style={styles.safe}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: contentPaddingBottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {children}
    </ScrollView>
  </SafeAreaView>
);

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export const AdminCard = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const SectionHeading = ({ label }: { label: string }) => (
  <Text style={styles.sectionHeading}>{label}</Text>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475467',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
});
