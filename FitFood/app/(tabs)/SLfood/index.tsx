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
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../constants/Colors';
import { Food, MealType } from './types';
import { foodService } from '../../services/foodService';
import FoodDetailModal from './components/FoodDetailModal';

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
      setFoods(data || []);
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
      food.name?.toLowerCase().includes(query) ||
      (food.name_si && food.name_si.toLowerCase().includes(query)) ||
      (food.short_description && food.short_description.toLowerCase().includes(query))
    );
  });

  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  // Get placeholder image
  const getImageUrl = (item: Food) => {
    if (item.image_url && item.image_url.startsWith('http')) {
      return item.image_url;
    }
    const placeholders = {
      breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
      lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      dinner: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    };
    return placeholders[selectedMeal] || 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Food';
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // Get difficulty icon
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '😊';
      case 'medium': return '🤔';
      case 'hard': return '😅';
      default: return '😊';
    }
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodCardWrapper}
      onPress={() => handleFoodPress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.foodCard}>
        {/* Image Container with Gradient Overlay */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getImageUrl(item) }} 
            style={styles.foodImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.imageGradient}
          />
          
          {/* Difficulty Badge */}
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty || 'Easy') }]}>
            <Text style={styles.difficultyBadgeText}>
              {getDifficultyIcon(item.difficulty || 'Easy')} {item.difficulty || 'Easy'}
            </Text>
          </View>

          {/* Dietary Tags - Top Right */}
          <View style={styles.dietaryTagsContainer}>
            {item.is_vegetarian && (
              <View style={[styles.dietaryTagSmall, styles.vegetarianTag]}>
                <Text style={styles.dietaryTagSmallText}>🌱</Text>
              </View>
            )}
            {item.is_vegan && (
              <View style={[styles.dietaryTagSmall, styles.veganTag]}>
                <Text style={styles.dietaryTagSmallText}>🌿</Text>
              </View>
            )}
            {item.is_gluten_free && (
              <View style={[styles.dietaryTagSmall, styles.glutenFreeTag]}>
                <Text style={styles.dietaryTagSmallText}>🚫</Text>
              </View>
            )}
          </View>

          {/* Cooking Time Badge - Bottom Right */}
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.timeBadgeText}>{item.cooking_time || 0}m</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
              {item.name_si && (
                <Text style={styles.foodNameSi} numberOfLines={1}>{item.name_si}</Text>
              )}
            </View>
            <View style={styles.caloriesBadge}>
              <Text style={styles.caloriesText}>{item.nutrition?.calories || 0}</Text>
              <Text style={styles.caloriesLabel}>cal</Text>
            </View>
          </View>

          <Text style={styles.foodDesc} numberOfLines={2}>
            {item.short_description || item.description?.substring(0, 60) + '...' || 'Delicious Sri Lankan food'}
          </Text>


          {/* Footer */}
          <View style={styles.footerRow}>
            <View style={styles.servingsContainer}>
              <Ionicons name="people-outline" size={14} color={colors.textLight} />
              <Text style={styles.servingsText}>{item.servings || 2} servings</Text>
            </View>
            <View style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </View>
          </View>
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
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
          <Ionicons name="search" size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
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
            ListEmptyComponent={renderEmptyState}
          />
        )}

        {/* Food Detail Modal */}
        <FoodDetailModal
          visible={modalVisible}
          food={selectedFood}
          onClose={() => setModalVisible(false)}
        />
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 53,
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
    textAlign: 'center',
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
    paddingHorizontal: 18,
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
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  foodList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  foodCardWrapper: {
    marginBottom: 16,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  dietaryTagsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  dietaryTagSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dietaryTagSmallText: {
    fontSize: 14,
  },
  vegetarianTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  veganTag: {
    backgroundColor: 'rgba(102, 187, 106, 0.8)',
  },
  glutenFreeTag: {
    backgroundColor: 'rgba(255, 167, 38, 0.8)',
  },
  timeBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  foodName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15
  },
  foodNameSi: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  caloriesBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 55,
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  caloriesLabel: {
    fontSize: 9,
    color: colors.textLight,
  },
  foodDesc: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
    lineHeight: 18,
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  nutritionLabel: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  nutritionDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E8ECF0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  servingsText: {
    fontSize: 12,
    color: colors.textLight,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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