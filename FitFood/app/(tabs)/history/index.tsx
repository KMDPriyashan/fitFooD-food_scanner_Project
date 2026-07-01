import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../../../constants/Colors';

export default function HistoryScreen() {
  const scans = [
    { id: '1', food: 'Chicken Salad', score: 78, date: 'Today' },
    { id: '2', food: 'Apple', score: 92, date: 'Today' },
    { id: '3', food: 'Pizza', score: 45, date: 'Yesterday' },
    { id: '4', food: 'Sushi', score: 76, date: '2 days ago' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 History</Text>
      </View>

      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.itemFood}>{item.food}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <Text style={[styles.itemScore, { color: getScoreColor(item.score) }]}>
              {item.score}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  list: { padding: 20 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemFood: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  itemDate: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  itemScore: { fontSize: 20, fontWeight: 'bold' },
});