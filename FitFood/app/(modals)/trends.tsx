import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

export default function TrendsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    scores: [65, 70, 72, 68, 78, 75, 82],
    calories: [2100, 1900, 2200, 2000, 1800, 1950, 2100],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: () => colors.textLight,
  };

  const currentData = period === 'week' ? weeklyData : weeklyData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Health Trends</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodBtn, period === 'week' && styles.activePeriod]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodBtn, period === 'month' && styles.activePeriod]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Health Score Trend</Text>
          <LineChart
            data={{
              labels: currentData.labels,
              datasets: [{ data: currentData.scores }],
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>75</Text>
              <Text style={styles.summaryLabel}>Avg Score</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>2,075</Text>
              <Text style={styles.summaryLabel}>Avg Calories</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>Sun</Text>
              <Text style={styles.summaryLabel}>Best Day</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Improvement Tips</Text>
          <Text style={styles.tipText}>• Try to eat more green vegetables</Text>
          <Text style={styles.tipText}>• Reduce sodium intake</Text>
          <Text style={styles.tipText}>• Maintain protein levels</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  periodBtn: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  activePeriod: { backgroundColor: colors.primary },
  periodText: { color: colors.text },
  activePeriodText: { color: colors.white },
  content: { flex: 1, paddingHorizontal: 20 },
  chartCard: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  chart: { borderRadius: 12 },
  summaryCard: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  summaryLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  tipsCard: {
    backgroundColor: colors.primaryLight + '20',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  tipText: { fontSize: 14, color: colors.text, marginBottom: 4 },
});