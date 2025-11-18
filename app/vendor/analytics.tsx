// app/(vendor)/analytics.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  BarChart as RNBarChart,
  PieChart as RNPieChart,
  LineChart as RNLineChart,
} from 'react-native-chart-kit';
// ✅ Use the new shared utilities instead of getVendorState
import { useLanguage } from '../../lib/vendor-utils';

const { width } = Dimensions.get("window");

const AnalyticsScreen = () => {
  // ✅ Use the new language hook
  const { language, toggleLanguage, t } = useLanguage();
  const [analyticsView, setAnalyticsView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Mock data for analytics
  const dailySalesData = [
    { hour: "18:00", sales: 12, revenue: 36, waste: 0 },
    { hour: "19:00", sales: 28, revenue: 84, waste: 0 },
    { hour: "20:00", sales: 35, revenue: 105, waste: 2 },
    { hour: "21:00", sales: 22, revenue: 66, waste: 3 },
    { hour: "22:00", sales: 8, revenue: 24, waste: 5 },
  ];

  const weeklyData = [
    { day: "Isnin", sales: 95, revenue: 285, waste: 12, forecastAccuracy: 88 },
    { day: "Selasa", sales: 87, revenue: 261, waste: 8, forecastAccuracy: 92 },
    { day: "Rabu", sales: 103, revenue: 309, waste: 15, forecastAccuracy: 85 },
    { day: "Khamis", sales: 91, revenue: 273, waste: 10, forecastAccuracy: 90 },
    { day: "Jumaat", sales: 127, revenue: 381, waste: 8, forecastAccuracy: 92 },
    { day: "Sabtu", sales: 145, revenue: 435, waste: 18, forecastAccuracy: 87 },
    { day: "Ahad", sales: 132, revenue: 396, waste: 14, forecastAccuracy: 89 },
  ];

  const monthlyTrends = [
    { month: "Jan", profit: 2450, wasteCost: 180, itemsSold: 1250 },
    { month: "Feb", profit: 2680, wasteCost: 150, itemsSold: 1320 },
    { month: "Mac", profit: 2890, wasteCost: 120, itemsSold: 1450 },
    { month: "Apr", profit: 3120, wasteCost: 95, itemsSold: 1580 },
    { month: "Mei", profit: 3340, wasteCost: 80, itemsSold: 1680 },
    { month: "Jun", profit: 3580, wasteCost: 65, itemsSold: 1780 },
  ];

  const topItems = [
    {
      name: "Nasi Lemak",
      population: 45,
      color: "#4ade80",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Satay",
      population: 30,
      color: "#f59e0b",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Apam Balik",
      population: 25,
      color: "#ef4444",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Cendol",
      population: 35,
      color: "#3b82f6",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ];

  const inventoryTurnover = [
    { item: "Beras", turnover: 4.2, days: 7 },
    { item: "Ayam", turnover: 3.8, days: 8 },
    { item: "Telur", turnover: 5.1, days: 6 },
    { item: "Santan", turnover: 2.9, days: 10 },
  ];

  const performanceMetrics = {
    salesAccuracy: 91,
    wasteReduction: 35,
    profitGrowth: 28,
    inventoryEfficiency: 87,
  };

  // Chart data preparation
  const getDailyChartData = () => ({
    labels: dailySalesData.map((item) => item.hour),
    datasets: [
      {
        data: dailySalesData.map((item) => item.sales),
      },
    ],
  });

  const getWeeklyChartData = () => ({
    labels: weeklyData.map((item) => item.day),
    datasets: [
      {
        data: weeklyData.map((item) => item.sales),
      },
    ],
  });

  const getMonthlyChartData = () => ({
    labels: monthlyTrends.map((item) => item.month),
    datasets: [
      {
        data: monthlyTrends.map((item) => item.profit),
      },
    ],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      {/* Header with language toggle */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t.analytics}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={20} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <MaterialIcons name="download" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <Text style={styles.languageText}>
              {language === "ms" ? "EN" : "BM"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Period Selector */}
      <View style={styles.timeSelector}>
        {(["daily", "weekly", "monthly"] as const).map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setAnalyticsView(period)}
            style={[
              styles.timeButton,
              analyticsView === period && styles.timeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.timeButtonText,
                analyticsView === period && styles.timeButtonTextActive,
              ]}
            >
              {t[period]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Performance Overview Cards */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <MaterialIcons name="track-changes" size={24} color="#16a34a" />
          <Text style={styles.metricNumber}>
            {performanceMetrics.salesAccuracy}%
          </Text>
          <Text style={styles.metricLabel}>Ketepatan Ramalan</Text>
        </View>
        <View style={styles.metricCard}>
          <MaterialIcons name="delete" size={24} color="#ef4444" />
          <Text style={styles.metricNumber}>
            {performanceMetrics.wasteReduction}%
          </Text>
          <Text style={styles.metricLabel}>Pengurangan Sisa</Text>
        </View>
        <View style={styles.metricCard}>
          <MaterialIcons name="trending-up" size={24} color="#3b82f6" />
          <Text style={styles.metricNumber}>
            {performanceMetrics.profitGrowth}%
          </Text>
          <Text style={styles.metricLabel}>Pertumbuhan Untung</Text>
        </View>
        <View style={styles.metricCard}>
          <MaterialIcons name="scale" size={24} color="#8b5cf6" />
          <Text style={styles.metricNumber}>
            {performanceMetrics.inventoryEfficiency}%
          </Text>
          <Text style={styles.metricLabel}>Kecekapan Inventori</Text>
        </View>
      </View>

      {/* Main Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {analyticsView === "daily" && "Jualan Harian Mengikut Masa"}
          {analyticsView === "weekly" && "Prestasi Mingguan"}
          {analyticsView === "monthly" && "Trend Bulanan"}
        </Text>

        <View style={styles.chartWrapper}>
          {analyticsView === "daily" && (
            <RNBarChart
              data={getDailyChartData()}
              width={width - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          )}
          {analyticsView === "weekly" && (
            <RNBarChart
              data={getWeeklyChartData()}
              width={width - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          )}
          {analyticsView === "monthly" && (
            <RNLineChart
              data={getMonthlyChartData()}
              width={width - 40}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
              }}
              style={styles.chart}
            />
          )}
        </View>
      </View>

      {/* Item Performance */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Prestasi Item</Text>
        <View style={styles.pieChartContainer}>
          <RNPieChart
            data={topItems}
            width={width * 0.4}
            height={180}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
          <View style={styles.pieLegend}>
            {topItems.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: item.color }]}
                />
                <Text style={styles.legendText}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Inventory Turnover */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Pusingan Inventori</Text>
        <View style={styles.turnoverList}>
          {inventoryTurnover.map((item, index) => (
            <View key={index} style={styles.turnoverItem}>
              <Text style={styles.turnoverItemName}>{item.item}</Text>
              <View style={styles.turnoverDetails}>
                <Text style={styles.turnoverText}>{item.turnover}x/bulan</Text>
                <View style={styles.turnoverTime}>
                  <MaterialIcons name="access-time" size={14} color="#6b7280" />
                  <Text style={styles.turnoverText}>{item.days} hari</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Waste Reduction Report */}
      <View style={styles.wasteReport}>
        <View style={styles.wasteHeader}>
          <MaterialIcons name="delete" size={20} color="white" />
          <Text style={styles.wasteTitle}>Laporan Pengurangan Sisa</Text>
        </View>
        <View style={styles.wasteGrid}>
          <View style={styles.wasteItem}>
            <Text style={styles.wasteNumber}>RM65</Text>
            <Text style={styles.wasteLabel}>Kos Sisa Semasa</Text>
          </View>
          <View style={styles.wasteItem}>
            <Text style={styles.wasteNumber}>-35%</Text>
            <Text style={styles.wasteLabel}>Pengurangan Minggu Ini</Text>
          </View>
        </View>
        <Text style={styles.wasteSavings}>
          Anda telah menjimatkan RM115 minggu ini berbanding bulan lepas!
        </Text>
      </View>
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
  filterButton: {
    backgroundColor: "#f3f4f6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#3b82f6",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  timeSelector: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "#3b82f6",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  timeButtonTextActive: {
    color: "white",
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginVertical: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: "center",
  },
  chart: {
    borderRadius: 16,
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  pieLegend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#4b5563",
  },
  turnoverList: {
    gap: 12,
  },
  turnoverItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  turnoverItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  turnoverDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  turnoverText: {
    fontSize: 14,
    color: "#6b7280",
  },
  turnoverTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  wasteReport: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    padding: 16,
  },
  wasteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  wasteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  wasteGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  wasteItem: {
    alignItems: "center",
  },
  wasteNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  wasteLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  wasteSavings: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 16,
  },
});

export default AnalyticsScreen;