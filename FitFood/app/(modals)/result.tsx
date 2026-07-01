import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {colors} from '../../constants/Colors';
import { getHealthScoreColor } from '@/constants/Colors';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const foodName = params.food || 'Chicken Salad';
  const score = parseInt(params.score as string) || 78;

  const color = getHealthScoreColor(score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🥗 Analysis Result</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.foodNameContainer}>
          <Text style={styles.foodName}>{foodName}</Text>
        </View>

        <View style={[styles.scoreContainer, { backgroundColor: color + '20' }]}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color }]}>
            {score >= 80 ? 'Excellent! 🎉' :
             score >= 60 ? 'Good! 👍' :
             score >= 40 ? 'Average 😐' :
             score >= 20 ? 'Poor 😕' : 'Bad 😢'}
          </Text>
        </View>

        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>350</Text>
            <Text style={styles.nutritionLabel}>🔥 Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>25g</Text>
            <Text style={styles.nutritionLabel}>💪 Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>30g</Text>
            <Text style={styles.nutritionLabel}>🍞 Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>12g</Text>
            <Text style={styles.nutritionLabel}>🧈 Fat</Text>
          </View>
        </View>

        <View style={styles.pointsContainer}>
          <View style={styles.goodPoints}>
            <Text style={styles.pointsTitle}>✅ Good Points</Text>
            <Text style={styles.pointText}>• High in protein</Text>
            <Text style={styles.pointText}>• Good source of fiber</Text>
            <Text style={styles.pointText}>• Low in saturated fat</Text>
          </View>
          <View style={styles.badPoints}>
            <Text style={styles.pointsTitle}>⚠️ Bad Points</Text>
            <Text style={styles.pointText}>• High in sodium</Text>
            <Text style={styles.pointText}>• Contains added sugars</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>💾 Save to History</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  content: { flex: 1, padding: 20 },
  foodNameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  foodName: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  scoreContainer: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: { fontSize: 60, fontWeight: 'bold' },
  scoreLabel: { fontSize: 20, fontWeight: '600', marginTop: 5 },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  nutritionValue: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  nutritionLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  pointsContainer: {
    marginBottom: 20,
  },
  goodPoints: {
    backgroundColor: colors.success + '20',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  badPoints: {
    backgroundColor: colors.danger + '20',
    padding: 15,
    borderRadius: 10,
  },
  pointsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  pointText: { fontSize: 14, color: colors.text, marginBottom: 4 },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});