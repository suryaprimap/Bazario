import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialIcons} from "@expo/vector-icons";
import {
  BarChart as RNBarChart,
  PieChart as RNPieChart,
  LineChart as RNLineChart,
} from "react-native-chart-kit";

// Type definitions
type Language = "ms" | "en";

interface TranslationMap {
  dashboard: string;
  inventory: string;
  analytics: string;
  alerts: string;
  pos: string;
  prepare: string;
  portions: string;
  stock: string;
  low: string;
  sales: string;
  today: string;
  revenue: string;
  items: string;
  connected: string;
  notConnected: string;
  connectPos: string;
  automated: string;
  manual: string;
  briefing: string;
  waste: string;
  performance: string;
  daily: string;
  weekly: string;
  monthly: string;
  profit: string;
  wasteCost: string;
  forecastAccuracy: string;
  itemsSold: string;
  turnover: string;
  efficiency: string;
  growth: string;
  reduction: string;
  export: string;
  filter: string;
}

interface Translations {
  ms: TranslationMap;
  en: TranslationMap;
}

const { width } = Dimensions.get("window");

const App = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "inventory" | "analytics" | "alerts"
  >("dashboard");
  const [language, setLanguage] = useState<Language>("ms");
  const [isOffline, setIsOffline] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

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

  const translations: Translations = {
    ms: {
      dashboard: "Papan Pemuka",
      inventory: "Inventori",
      analytics: "Analitik",
      alerts: "Amaran",
      pos: "Sistem POS",
      prepare: "Sediakan",
      portions: "hidangan",
      stock: "Stok",
      low: "Rendah",
      sales: "Jualan",
      today: "Hari Ini",
      revenue: "Pendapatan",
      items: "Item",
      connected: "Tersambung",
      notConnected: "Tidak Tersambung",
      connectPos: "Sambung POS",
      automated: "Automatik",
      manual: "Manual",
      briefing: "Ringkasan Harian",
      waste: "Sisa",
      performance: "Prestasi",
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      profit: "Keuntungan",
      wasteCost: "Kos Sisa",
      forecastAccuracy: "Ketepatan Ramalan",
      itemsSold: "Item Terjual",
      turnover: "Pusingan Inventori",
      efficiency: "Kecekapan",
      growth: "Pertumbuhan",
      reduction: "Pengurangan",
      export: "Eksport Data",
      filter: "Tapis",
    },
    en: {
      dashboard: "Dashboard",
      inventory: "Inventory",
      analytics: "Analytics",
      alerts: "Alerts",
      pos: "POS System",
      prepare: "Prepare",
      portions: "portions",
      stock: "Stock",
      low: "Low",
      sales: "Sales",
      today: "Today",
      revenue: "Revenue",
      items: "Items",
      connected: "Connected",
      notConnected: "Not Connected",
      connectPos: "Connect POS",
      automated: "Automated",
      manual: "Manual",
      briefing: "Daily Briefing",
      waste: "Waste",
      performance: "Performance",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      profit: "Profit",
      wasteCost: "Waste Cost",
      forecastAccuracy: "Forecast Accuracy",
      itemsSold: "Items Sold",
      turnover: "Inventory Turnover",
      efficiency: "Efficiency",
      growth: "Growth",
      reduction: "Reduction",
      export: "Export Data",
      filter: "Filter",
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Simplified offline detection for React Native
    setIsOffline(false);
  }, []);

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

  const renderDashboard = () => (
    <View style={styles.contentContainer}>
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
    </View>
  );

  const renderInventory = () => (
    <View style={styles.contentContainer}>
      <View style={styles.inventoryHeader}>
        <Text style={styles.sectionTitle}>{t.inventory}</Text>
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
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.contentContainer}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.sectionTitle}>{t.analytics}</Text>
        <View style={styles.analyticsActions}>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={20} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.downloadButton}>
            <MaterialIcons name="download" size={20} color="white" />
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
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.sectionTitle}>{t.alerts}</Text>
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
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "inventory":
        return renderInventory();
      case "analytics":
        return renderAnalytics();
      case "alerts":
        return renderAlerts();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>B</Text>
          </View>
          <Text style={styles.appTitle}>Bazario</Text>
        </View>

        <View style={styles.headerRight}>
          {isOffline && (
            <View style={styles.offlineBadge}>
              <MaterialIcons name="wifi-off" size={12} color="#d97706" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setLanguage(language === "ms" ? "en" : "ms")}
          >
            <Text style={styles.languageText}>
              {language === "ms" ? "BM" : "EN"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {renderContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          {
            id: "dashboard" as const,
            icon: "calendar-today",
            label: t.dashboard,
          },
          { id: "inventory" as const, icon: "inventory-2", label: t.inventory },
          { id: "analytics" as const, icon: "show-chart", label: t.analytics },
          { id: "alerts" as const, icon: "notifications", label: t.alerts },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.navButton,
              activeTab === tab.id && styles.navButtonActive,
            ]}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? "#3b82f6" : "#6b7280"}
            />
            <Text
              style={[
                styles.navButtonText,
                activeTab === tab.id && styles.navButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  appIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  appIconText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: "#d97706",
    fontWeight: "500",
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    paddingBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
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
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  analyticsActions: {
    flexDirection: "row",
    gap: 8,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: "#eff6ff",
  },
  navButtonText: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 2,
  },
  navButtonTextActive: {
    color: "#3b82f6",
  },
});

export default App;
