import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/Colors';
import { Food, MealType } from './types';
import { foodService } from '../../services/foodService';
import FoodDetailModal from './components/FoodDetailModal';
import BottomNav from '../../../components/BottomNav';

const { width, height } = Dimensions.get('window');

export default function SLFoodScreen() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mealTypes = [
    { id: 'breakfast' as MealType, label: 'Breakfast', icon: '🌅' },
    { id: 'lunch' as MealType, label: 'Lunch', icon: '☀️' },
    { id: 'dinner' as MealType, label: 'Dinner', icon: '🌙' },
  ];

  useEffect(() => {
    fetchFoods();
  }, [selectedMeal]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const data = await foodService.getFoodsByCategory(selectedMeal);
      setFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      food.name.toLowerCase().includes(query) ||
      (food.name_si && food.name_si.toLowerCase().includes(query)) ||
      (food.short_description && food.short_description.toLowerCase().includes(query))
    );
  });

  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => handleFoodPress(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image_url }} style={styles.foodImage} />
      <View style={styles.foodOverlay}>
        <View style={styles.foodBadge}>
          <Text style={styles.foodBadgeText}>{item.difficulty || 'Easy'}</Text>
        </View>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        {item.name_si && <Text style={styles.foodNameSi}>{item.name_si}</Text>}
        <Text style={styles.foodDesc} numberOfLines={2}>
          {item.short_description || item.description?.substring(0, 60) + '...' || ''}
        </Text>
        <View style={styles.foodStats}>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.nutrition?.calories || 0}</Text>
            <Text style={styles.foodStatLabel}>Cal</Text>
          </View>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.nutrition?.protein || 0}g</Text>
            <Text style={styles.foodStatLabel}>Protein</Text>
          </View>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.cooking_time || 0}m</Text>
            <Text style={styles.foodStatLabel}>Time</Text>
          </View>
        </View>
        <View style={styles.dietaryTags}>
          {item.is_vegetarian && (
            <View style={[styles.dietaryTag, styles.vegetarianTag]}>
              <Text style={styles.dietaryTagText}>🌱</Text>
            </View>
          )}
          {item.is_vegan && (
            <View style={[styles.dietaryTag, styles.veganTag]}>
              <Text style={styles.dietaryTagText}>🌿</Text>
            </View>
          )}
          {item.is_gluten_free && (
            <View style={[styles.dietaryTag, styles.glutenFreeTag]}>
              <Text style={styles.dietaryTagText}>🚫</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🍽️</Text>
      <Text style={styles.emptyTitle}>No foods found</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Try adjusting your search' : 'No foods available in this category'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sri Lankan Foods</Text>
            <View style={styles.headerPlaceholder} />
          </View>
          <Text style={styles.headerSubtitle}>🇱🇰 Discover traditional Sri Lankan cuisine</Text>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.mealSelector}>
          {mealTypes.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={[
                styles.mealButton,
                selectedMeal === meal.id && styles.mealButtonActive,
              ]}
              onPress={() => setSelectedMeal(meal.id)}
            >
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <Text style={[
                styles.mealLabel,
                selectedMeal === meal.id && styles.mealLabelActive,
              ]}>
                {meal.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Food List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading {selectedMeal} foods...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.foodList}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            ListEmptyComponent={renderEmptyState}
          />
        )}

        {/* Food Detail Modal */}
        <FoodDetailModal
          visible={modalVisible}
          food={selectedFood}
          onClose={() => setModalVisible(false)}
        />

        {/* Bottom Navigation */}
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  mealSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  mealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  mealButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  mealIcon: {
    fontSize: 16,
  },
  mealLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  mealLabelActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 16,
    color: colors.textLight,
    padding: 4,
  },
  foodList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 4,
  },
  foodCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  foodImage: {
    width: '100%',
    height: 130,
  },
  foodOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  foodBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  foodNameSi: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 1,
  },
  foodDesc: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    lineHeight: 16,
  },
  foodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  foodStat: {
    alignItems: 'center',
  },
  foodStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  foodStatLabel: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 1,
  },
  dietaryTags: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  dietaryTag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegetarianTag: {
    backgroundColor: '#E8F5E9',
  },
  veganTag: {
    backgroundColor: '#C8E6C9',
  },
  glutenFreeTag: {
    backgroundColor: '#FFF3E0',
  },
  dietaryTagText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
});