// app/(tabs)/meal-planner/shopping-list.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
  ActivityIndicator, // ✅ Added this import
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Storage from '../../services/meal-planner/storageService'; // ✅ Changed import
import { ShoppingItem } from '../../../types/meal-planner.types';

const CATEGORY_ICONS: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍎',
  grains: '🌾',
  dairy: '🥛',
  meat: '🥩',
  spices: '🌿',
  other: '📦',
};

const CATEGORY_COLORS: Record<string, string> = {
  vegetables: '#4CAF50',
  fruits: '#FF9800',
  grains: '#795548',
  dairy: '#2196F3',
  meat: '#F44336',
  spices: '#9C27B0',
  other: '#607D8B',
};

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Use Storage.getShoppingList
      const savedItems = await Storage.getShoppingList();
      if (savedItems.length === 0) {
        // Generate from meal plan
        const generated = await generateShoppingListFromPlan();
        setItems(generated);
      } else {
        setItems(savedItems);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate shopping list from meal plan
  const generateShoppingListFromPlan = async (): Promise<ShoppingItem[]> => {
    const plan = await Storage.getTodayMealPlan();
    const items: ShoppingItem[] = [];
    const foodMap = new Map<string, { quantity: number; category: string; unit: string }>();
    
    if (plan) {
      plan.meals.forEach(meal => {
        meal.foods.forEach(food => {
          const existing = foodMap.get(food);
          if (existing) {
            existing.quantity += 0.5;
          } else {
            foodMap.set(food, {
              quantity: 1,
              category: 'other',
              unit: 'unit',
            });
          }
        });
      });
    }
    
    foodMap.forEach((value, key) => {
      items.push({
        id: Date.now().toString() + Math.random().toString(),
        name: key,
        category: getCategoryForFood(key),
        quantity: value.quantity,
        unit: value.unit,
        checked: false,
      });
    });
    
    await Storage.saveShoppingList(items);
    return items;
  };

  const getCategoryForFood = (food: string): ShoppingItem['category'] => {
    const vegetable = ['Carrot', 'Tomato', 'Lettuce', 'Broccoli', 'Spinach', 'Potato', 'Onion', 'Garlic'];
    const fruits = ['Apple', 'Banana', 'Orange', 'Strawberry', 'Mango', 'Avocado'];
    const grains = ['Rice', 'Pasta', 'Bread', 'Oats', 'Quinoa'];
    const dairy = ['Milk', 'Yogurt', 'Cheese', 'Butter'];
    const meat = ['Chicken', 'Fish', 'Salmon', 'Minced Meat', 'Tofu'];
    const spices = ['Curry Powder', 'Soy Sauce', 'Olive Oil', 'Honey', 'Peanut Butter'];
    
    if (vegetable.includes(food)) return 'vegetables';
    if (fruits.includes(food)) return 'fruits';
    if (grains.includes(food)) return 'grains';
    if (dairy.includes(food)) return 'dairy';
    if (meat.includes(food)) return 'meat';
    if (spices.includes(food)) return 'spices';
    return 'other';
  };

  const toggleItem = async (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    await Storage.saveShoppingList(updated);
  };

  const deleteItem = async (id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = items.filter(item => item.id !== id);
            setItems(updated);
            await Storage.saveShoppingList(updated);
          },
        },
      ]
    );
  };

  const clearChecked = async () => {
    Alert.alert(
      'Clear Checked Items',
      'Remove all checked items from the list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const updated = items.filter(item => !item.checked);
            setItems(updated);
            await Storage.saveShoppingList(updated);
          },
        },
      ]
    );
  };

  const shareList = async () => {
    const text = items.map(item =>
      `${item.checked ? '✅' : '⬜'} ${item.name} - ${item.quantity} ${item.unit}`
    ).join('\n');
    
    await Share.share({
      message: `🛒 Shopping List\n\n${text}`,
      title: 'Shopping List',
    });
  };

  const generateNewList = async () => {
    Alert.alert(
      'Generate New List',
      'This will replace your current list. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            const generated = await generateShoppingListFromPlan();
            setItems(generated);
          },
        },
      ]
    );
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading shopping list...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Shopping List</Text>
        <TouchableOpacity onPress={shareList}>
          <Ionicons name="share-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={generateNewList}>
          <Ionicons name="refresh-outline" size={18} color="#E53935" />
          <Text style={styles.actionBtnText}>Generate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={clearChecked}>
          <Ionicons name="checkmark-done-outline" size={18} color="#E53935" />
          <Text style={styles.actionBtnText}>Clear Checked</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>
                {CATEGORY_ICONS[category] || '📦'} {category.toUpperCase()}
              </Text>
              <Text style={styles.categoryCount}>{categoryItems.length} items</Text>
            </View>

            {categoryItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={styles.itemCheck}>
                  {item.checked ? (
                    <Ionicons name="checkbox" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="square-outline" size={24} color="#94A3B8" />
                  )}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Empty List</Text>
            <Text style={styles.emptyText}>
              Add meals to your plan to generate a shopping list
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemRowChecked: {
    opacity: 0.6,
  },
  itemCheck: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#1E293B',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});