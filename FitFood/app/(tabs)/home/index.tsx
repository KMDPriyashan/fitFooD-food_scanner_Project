import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/Colors';

export default function HomeScreen() {
  const points = 250;
  const level = 3;
  const streak = 5;
  const healthScore = 78;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hello, User! 👋</Text>
        <Text style={styles.subtitle}>Ready to eat healthy?</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>⭐ Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>Lv.{level}</Text>
          <Text style={styles.statLabel}>🎯 Level</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>🔥 Streak</Text>
        </View>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.cardTitle}>Today's Health Score</Text>
        <Text style={styles.scoreValue}>{healthScore}</Text>
        <Text style={styles.scoreLabel}>Good! 👍 Keep it up!</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/scan')}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/trends')}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(modals)/badges')}>
          <Text style={styles.actionIcon}>🏆</Text>
          <Text style={styles.actionText}>Badges</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.challengeCard}>
        <Text style={styles.challengeTitle}>✨ Daily Challenge</Text>
        <Text style={styles.challengeText}>Scan 3 meals today</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={styles.progressText}>1/3 completed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -20,
    paddingHorizontal: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 5 },
  scoreCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  scoreValue: { fontSize: 50, fontWeight: 'bold', color: colors.primary },
  scoreLabel: { fontSize: 14, color: colors.textLight, marginTop: 5 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: { fontSize: 28 },
  actionText: { fontSize: 12, color: colors.text, marginTop: 5 },
  challengeCard: {
    backgroundColor: colors.secondaryLight + '30',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  challengeTitle: { fontSize: 16, fontWeight: 'bold' },
  challengeText: { fontSize: 14, color: colors.textLight, marginTop: 5, marginBottom: 15 },
  progressBar: { height: 8, backgroundColor: '#ddd', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { fontSize: 12, color: colors.textLight, marginTop: 8 },
});