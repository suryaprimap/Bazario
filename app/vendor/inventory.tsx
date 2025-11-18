// app/(vendor)/inventory.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// ✅ Use the new shared utilities instead of getVendorState
import { useLanguage } from '../../lib/vendor-utils';

const InventoryScreen = () => {
  // ✅ Use the new language hook
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      {/* Header with language toggle */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t.inventory}</Text>
        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <Text style={styles.languageText}>
            {language === "ms" ? "EN" : "BM"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inventoryHeader}>
        {/* <Text style={styles.sectionTitle}>{t.inventory}</Text> */}
        <View style={styles.automatedBadge}>
          <MaterialIcons name="verified" size={16} color="#16a34a" />
          <Text style={styles.automatedText}>{t.automated}</Text>
        </View>
      </View>

      {[
        { item: "Beras", stock: 6, max: 10, min: 3, low: true, unit: "kg" },
        { item: "Ayam", stock: 8, max: 15, min: 5, low: false, unit: "kg" },
        { item: "Telur", stock: 1, max: 20, min: 5, low: true, unit: "biji" },
        { item: "Santan", stock: 3, max: 8, min: 2, low: false, unit: "botol" },
      ].map((item, index) => (
        <View key={index} style={styles.inventoryCard}>
          <View style={styles.inventoryHeaderRow}>
            <Text style={styles.inventoryItemName}>{item.item}</Text>
            <View style={styles.inventoryStatus}>
              <View
                style={[
                  styles.stockBadge,
                  item.low ? styles.stockBadgeLow : styles.stockBadgeNormal,
                ]}
              >
                <Text
                  style={[
                    styles.stockBadgeText,
                    item.low
                      ? styles.stockBadgeTextLow
                      : styles.stockBadgeTextNormal,
                  ]}
                >
                  {item.stock}/{item.max} {t.stock}
                </Text>
              </View>
              {item.low && (
                <TouchableOpacity style={styles.orderButton}>
                  <MaterialIcons name="add" size={14} color="white" />
                  <Text style={styles.orderButtonText}>Pesan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((item.stock / item.max) * 100, 100)}%`,
                },
                item.stock <= item.min
                  ? styles.progressFillLow
                  : item.stock <= item.max * 0.3
                  ? styles.progressFillMedium
                  : styles.progressFillNormal,
              ]}
            />
          </View>
          <View style={styles.inventoryMinMax}>
            <Text style={styles.minMaxText}>
              Min: {item.min} {item.unit}
            </Text>
            <Text style={styles.minMaxText}>
              Max: {item.max} {item.unit}
            </Text>
          </View>
        </View>
      ))}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  automatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  automatedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#16a34a",
  },
  inventoryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inventoryHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  inventoryStatus: {
    alignItems: "flex-end",
    gap: 4,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeLow: {
    backgroundColor: "#fee2e2",
  },
  stockBadgeNormal: {
    backgroundColor: "#dcfce7",
  },
  stockBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stockBadgeTextLow: {
    color: "#ef4444",
  },
  stockBadgeTextNormal: {
    color: "#16a34a",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  orderButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
  },
  progressFillLow: {
    backgroundColor: "#ef4444",
  },
  progressFillMedium: {
    backgroundColor: "#f59e0b",
  },
  progressFillNormal: {
    backgroundColor: "#10b981",
  },
  inventoryMinMax: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  minMaxText: {
    fontSize: 12,
    color: "#6b7280",
  },
});

export default InventoryScreen;