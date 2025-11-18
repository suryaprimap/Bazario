// app/(vendor)/alerts.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../lib/vendor-utils';

const AlertsScreen = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      {/* Header with language toggle */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t.alerts}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <Text style={styles.languageText}>
            {language === "ms" ? "EN" : "BM"}
          </Text>
        </TouchableOpacity>
      </View>

      {[
        {
          type: "pos",
          message: "POS tersambung - inventori dikemas kini secara automatik",
          icon: "cloud-done",
          status: "success",
        },
        {
          type: "inventory",
          message: "Stok telur rendah (1/20) - pesan sekarang?",
          icon: "warning",
          status: "warning",
        },
        {
          type: "forecast",
          message:
            "Ramalan dikemas kini secara langsung berdasarkan jualan hari ini",
          icon: "autorenew",
          status: "info",
        },
      ].map((alert, index) => {
        const iconColor =
          alert.status === "success"
            ? "#16a34a"
            : alert.status === "warning"
            ? "#d97706"
            : "#3b82f6";
        const bgColor =
          alert.status === "success"
            ? "#dcfce7"
            : alert.status === "warning"
            ? "#fef3c7"
            : "#dbeafe";

        return (
          <View
            key={index}
            style={[
              styles.alertCard,
              alert.status === "success"
                ? styles.alertSuccess
                : alert.status === "warning"
                ? styles.alertWarning
                : styles.alertInfo,
            ]}
          >
            <View
              style={[styles.alertIconContainer, { backgroundColor: bgColor }]}
            >
              <MaterialIcons
                name={alert.icon as any}
                size={20}
                color={iconColor}
              />
            </View>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  languageButton: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  alertCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertSuccess: {
    borderLeftColor: "#16a34a",
  },
  alertWarning: {
    borderLeftColor: "#d97706",
  },
  alertInfo: {
    borderLeftColor: "#3b82f6",
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  alertMessage: {
    color: "#1f2937",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AlertsScreen;