import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../constants/Colors';

// Mock badges data
const BADGES = [
  { id: '1', name: 'Beginner', icon: '⭐', earned: true, points: 50 },
  { id: '2', name: 'Consistent', icon: '🔥', earned: true, points: 100 },
  { id: '3', name: 'Health Warrior', icon: '⚔️', earned: true, points: 200 },
  { id: '4', name: 'Legend', icon: '🏆', earned: false, points: 500 },
  { id: '5', name: 'Veggie Lover', icon: '🥦', earned: true, points: 150 },
  { id: '6', name: 'Fruit Explorer', icon: '🍎', earned: false, points: 150 },
  { id: '7', name: 'Perfect Week', icon: '📅', earned: false, points: 200 },
  { id: '8', name: 'Unstoppable', icon: '🚀', earned: false, points: 300 },
];

export default function BadgesScreen() {
  const earnedCount = BADGES.filter(b => b.earned).length;
  const totalPoints = BADGES.reduce((sum, b) => sum + (b.earned ? b.points : 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 My Badges</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{earnedCount}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{BADGES.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      <FlatList
        data={BADGES}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={[styles.badgeItem, !item.earned && styles.lockedBadge]}>
            <Text style={styles.badgeIcon}>{item.icon}</Text>
            <Text style={[styles.badgeName, !item.earned && styles.lockedText]}>
              {item.name}
            </Text>
            {item.earned ? (
              <Text style={styles.earnedText}>✅</Text>
            ) : (
              <Text style={styles.lockedText}>🔒</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.badgeGrid}
        showsVerticalScrollIndicator={false}
      />
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: colors.white },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  badgeGrid: {
    padding: 20,
    paddingBottom: 30,
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    margin: 5,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  lockedBadge: { opacity: 0.5 },
  badgeIcon: { fontSize: 30 },
  badgeName: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 5, textAlign: 'center' },
  earnedText: { fontSize: 14, color: colors.success, marginTop: 4 },
  lockedText: { fontSize: 14, color: colors.gray, marginTop: 4 },
});