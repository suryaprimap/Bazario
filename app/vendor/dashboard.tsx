// app/(vendor)/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../lib/vendor-utils';


const DashboardScreen = () => {
  // ✅ Use the new language hook
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      {/* Header with language toggle */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <Text style={styles.languageText}>
            {language === "ms" ? "EN" : "BM"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* POS Connection Status */}
      <View style={styles.posStatus}>
        <View style={styles.posHeader}>
          <MaterialIcons name="cloud-done" size={20} color="#16a34a" />
          <View style={styles.posTextContainer}>
            <Text style={styles.posTitle}>Sistem POS</Text>
            <Text style={styles.posStatusText}>Tersambung</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 16 }} />
      
      {/* Live Sales Monitor */}
      <View style={styles.salesMonitor}>
        <View style={styles.salesHeader}>
          <Text style={styles.salesTitle}>
            {t.sales} {t.today}
          </Text>
          <MaterialIcons name="trending-up" size={20} color="white" />
        </View>
        <View style={styles.salesGrid}>
          <View style={styles.salesItem}>
            <Text style={styles.salesNumber}>127</Text>
            <Text style={styles.salesLabel}>{t.items}</Text>
          </View>
          <View style={styles.salesItem}>
            <Text style={styles.salesNumber}>RM381.5</Text>
            <Text style={styles.salesLabel}>{t.revenue}</Text>
          </View>
        </View>
      </View>

      {/* Daily Briefing */}
      <View style={styles.briefingCard}>
        <View style={styles.briefingHeader}>
          <MaterialIcons name="calendar-today" size={20} color="#f97316" />
          <Text style={styles.briefingTitle}>{t.briefing}</Text>
        </View>
        <View style={styles.briefingContent}>
          <View style={styles.briefingItem}>
            <MaterialIcons name="check-circle" size={16} color="#16a34a" />
            <Text style={styles.briefingText}>
              <Text style={styles.briefingBold}>Ramalan:</Text> Sediakan 45 Nasi
              Lemak, 30 Satay
            </Text>
          </View>
          <View style={styles.briefingItem}>
            <MaterialIcons name="sunny" size={16} color="#f59e0b" />
            <Text style={styles.briefingText}>
              <Text style={styles.briefingBold}>Cuaca:</Text> Cerah (28°C) -
              sesuai untuk makanan panggang!
            </Text>
          </View>
          <View style={styles.briefingItem}>
            <MaterialIcons name="warning" size={16} color="#ef4444" />
            <Text style={styles.briefingText}>
              <Text style={styles.briefingBold}>Amaran Stok:</Text> Telur hampir
              habis - pesan 2 tray?
            </Text>
          </View>
          <View style={styles.briefingItem}>
            <MaterialIcons name="trending-up" size={16} color="#3b82f6" />
            <Text style={styles.briefingText}>
              <Text style={styles.briefingBold}>Prestasi Semalam:</Text> 92%
              terjual, hanya 8 satay disia-siakan
            </Text>
          </View>
        </View>
      </View>

      {/* Top Selling Items */}
      <View>
        <Text style={styles.sectionTitle}>Item Terlaris Hari Ini</Text>
        <View style={styles.topItemsContainer}>
          {[
            { name: "Nasi Lemak", sold: 42, icon: "🍚" },
            { name: "Satay", sold: 28, icon: "🍢" },
            { name: "Apam Balik", sold: 22, icon: "🥞" },
            { name: "Cendol", sold: 35, icon: "🍧" },
          ].map((item, index) => (
            <View key={index} style={styles.topItemCard}>
              <View style={styles.topItemContent}>
                <Text style={styles.foodIcon}>{item.icon}</Text>
                <Text style={styles.topItemName}>{item.name}</Text>
              </View>
              <View style={styles.soldBadge}>
                <Text style={styles.soldText}>{item.sold} terjual</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// ✅ Add TouchableOpacity to imports

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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  posStatus: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  posHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  posTextContainer: {
    gap: 4,
  },
  posTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  posStatusText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "500",
  },
  salesMonitor: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  salesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  salesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  salesItem: {
    alignItems: "center",
  },
  salesNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  briefingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  briefingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  briefingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  briefingContent: {
    gap: 12,
  },
  briefingItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  briefingText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  briefingBold: {
    fontWeight: "600",
    color: "#1f2937",
  },
  topItemsContainer: {
    gap: 12,
  },
  topItemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  foodIcon: {
    fontSize: 24,
  },
  topItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  soldBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  soldText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3b82f6",
  },
});

export default DashboardScreen;