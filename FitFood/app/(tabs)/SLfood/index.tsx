import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../../constants/Colors';
import { Food } from './types';

const { width, height } = Dimensions.get('window');

// Sri Lankan Food Database
const SRI_LANKAN_FOODS = [
  // Rice & Curry
  {
    id: '1',
    name: 'Rice and Curry',
    nameSi: 'බත් සහ කරි',
    category: 'Rice & Curry',
    calories: 450,
    protein: 12,
    carbs: 65,
    fat: 15,
    fiber: 4,
    description: 'Traditional Sri Lankan meal with rice and multiple curries',
    image: 'https://images.unsplash.com/photo-1583611629270-7e7c39b98324?w=400',
    goodPoints: ['Good source of carbs', 'Variety of vegetables', 'Balanced meal'],
    badPoints: ['High in carbs', 'Can be oily'],
  },
  {
    id: '2',
    name: 'Kiribath',
    nameSi: 'කිරිබත්',
    category: 'Rice & Curry',
    calories: 320,
    protein: 6,
    carbs: 60,
    fat: 8,
    fiber: 2,
    description: 'Milk rice - traditional Sri Lankan breakfast',
    image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
    goodPoints: ['Easy to digest', 'Good for breakfast'],
    badPoints: ['High in carbs', 'Low in protein'],
  },
  {
    id: '3',
    name: 'Lunu Miris',
    nameSi: 'ලුණු මිරිස්',
    category: 'Rice & Curry',
    calories: 50,
    protein: 1,
    carbs: 8,
    fat: 2,
    fiber: 2,
    description: 'Spicy red onion and chili sambol',
    image: 'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=400',
    goodPoints: ['Rich in vitamins', 'Boosts metabolism'],
    badPoints: ['High in sodium', 'Spicy'],
  },
  {
    id: '4',
    name: 'Pol Sambol',
    nameSi: 'පොල් සම්බෝල',
    category: 'Rice & Curry',
    calories: 180,
    protein: 2,
    carbs: 8,
    fat: 15,
    fiber: 4,
    description: 'Coconut sambol - essential Sri Lankan condiment',
    image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
    goodPoints: ['Healthy fats from coconut', 'Rich in fiber'],
    badPoints: ['High in calories', 'High in fat'],
  },

  // Traditional Sweets
  {
    id: '5',
    name: 'Kavum',
    nameSi: 'කැවුම්',
    category: 'Traditional Sweets',
    calories: 220,
    protein: 3,
    carbs: 30,
    fat: 12,
    fiber: 1,
    description: 'Deep-fried sweet made from rice flour and treacle',
    image: 'https://images.unsplash.com/photo-1583611629270-7e7c39b98324?w=400',
    goodPoints: ['Traditional taste', 'Energy boost'],
    badPoints: ['High in sugar', 'Deep-fried'],
  },
  {
    id: '6',
    name: 'Kokis',
    nameSi: 'කොකිස්',
    category: 'Traditional Sweets',
    calories: 180,
    protein: 2,
    carbs: 25,
    fat: 10,
    fiber: 1,
    description: 'Crispy deep-fried sweet made from rice flour and coconut milk',
    image: 'https://images.unsplash.com/photo-1583611629270-7e7c39b98324?w=400',
    goodPoints: ['Crispy texture', 'Traditional taste'],
    badPoints: ['High in calories', 'Deep-fried'],
  },
  {
    id: '7',
    name: 'Undu Walalu (SL)',
    nameSi: 'උණ්ඩු වළලු',
    category: 'Traditional Sweets',
    calories: 200,
    protein: 4,
    carbs: 28,
    fat: 10,
    fiber: 2,
    description: 'Urad dal and jaggery sweet - traditional Sri Lankan dessert',
    image: 'https://images.unsplash.com/photo-1583611629270-7e7c39b98324?w=400',
    goodPoints: ['High in protein', 'Traditional taste'],
    badPoints: ['High in sugar', 'High in calories'],
  },

  // Local Fruits
  {
    id: '8',
    name: 'Rambutan',
    nameSi: 'රම්බුටන්',
    category: 'Local Fruits',
    calories: 82,
    protein: 1,
    carbs: 20,
    fat: 0.3,
    fiber: 3,
    description: 'Sweet tropical fruit with a hairy red skin',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f1e5?w=400',
    goodPoints: ['Rich in Vitamin C', 'Good for immunity'],
    badPoints: ['High in sugar', 'Seasonal fruit'],
  },
  {
    id: '9',
    name: 'Mango',
    nameSi: 'අඹ',
    category: 'Local Fruits',
    calories: 60,
    protein: 1,
    carbs: 15,
    fat: 0.4,
    fiber: 2,
    description: 'Sweet tropical fruit - Sri Lankan king of fruits',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f1e5?w=400',
    goodPoints: ['Rich in Vitamin A', 'Good for skin'],
    badPoints: ['High in sugar', 'Seasonal fruit'],
  },
  {
    id: '10',
    name: 'Jackfruit',
    nameSi: 'කොස්',
    category: 'Local Fruits',
    calories: 95,
    protein: 2,
    carbs: 23,
    fat: 0.6,
    fiber: 4,
    description: 'Large tropical fruit - versatile in Sri Lankan cuisine',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f1e5?w=400',
    goodPoints: ['Rich in fiber', 'Good for digestion'],
    badPoints: ['High in sugar', 'Seasonal fruit'],
  },

  // Local Vegetables
  {
    id: '11',
    name: 'Gotukola',
    nameSi: 'ගොටුකොල',
    category: 'Local Vegetables',
    calories: 30,
    protein: 2,
    carbs: 5,
    fat: 0.5,
    fiber: 3,
    description: 'Centella asiatica - traditional leafy green',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f1e5?w=400',
    goodPoints: ['Rich in antioxidants', 'Good for brain health'],
    badPoints: ['Bitter taste', 'Low in calories'],
  },
  {
    id: '12',
    name: 'Mukunuwenna',
    nameSi: 'මුකුණුවැන්න',
    category: 'Local Vegetables',
    calories: 25,
    protein: 3,
    carbs: 4,
    fat: 0.3,
    fiber: 2,
    description: 'Traditional leafy green - used in Sri Lankan cooking',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f1e5?w=400',
    goodPoints: ['Rich in iron', 'Good for anemia'],
    badPoints: ['Bitter taste', 'Low in calories'],
  },

  // Fish Dishes
  {
    id: '13',
    name: 'Fish Ambulthiyal',
    nameSi: 'මාළු අම්බුල්තිය',
    category: 'Fish Dishes',
    calories: 280,
    protein: 25,
    carbs: 5,
    fat: 18,
    fiber: 2,
    description: 'Spicy sour fish curry - traditional Sri Lankan dish',
    image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
    goodPoints: ['High in protein', 'Rich in Omega-3'],
    badPoints: ['High in sodium', 'Spicy'],
  },
  {
    id: '14',
    name: 'Jodi Fish',
    nameSi: 'ජෝඩි මාළු',
    category: 'Fish Dishes',
    calories: 250,
    protein: 22,
    carbs: 6,
    fat: 16,
    fiber: 1,
    description: 'Traditional dry fish curry',
    image: 'https://images.unsplash.com/photo-1558582188-3c1e35f37be9?w=400',
    goodPoints: ['High in protein', 'Long shelf life'],
    badPoints: ['High in sodium', 'High in cholesterol'],
  },
];

const categories = ['All', 'Rice & Curry', 'Traditional Sweets', 'Local Fruits', 'Local Vegetables', 'Fish Dishes'];

export default function SLFoodScreen() {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Filter foods based on search and category
  const filteredFoods = useMemo(() => {
    let foods = SRI_LANKAN_FOODS;
    
    if (selectedCategory !== 'All') {
      foods = foods.filter(food => food.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      foods = foods.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.nameSi.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
      );
    }
    
    return foods;
  }, [searchQuery, selectedCategory]);

  const handleFoodPress = (food: Food) => {
    setSelectedFood(food);
    setModalVisible(true);
  };

  const renderFoodItem = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => handleFoodPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodNameSi}>{item.nameSi}</Text>
        <View style={styles.foodStats}>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.calories}</Text>
            <Text style={styles.foodStatLabel}>Cal</Text>
          </View>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.protein}g</Text>
            <Text style={styles.foodStatLabel}>Protein</Text>
          </View>
          <View style={styles.foodStat}>
            <Text style={styles.foodStatValue}>{item.carbs}g</Text>
            <Text style={styles.foodStatLabel}>Carbs</Text>
          </View>
        </View>
        <View style={styles.foodCategory}>
          <Text style={styles.foodCategoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
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
          <Text style={styles.headerSubtitle}>
            🇱🇰 Discover traditional Sri Lankan cuisine
          </Text>
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

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(renderCategoryItem)}
        </ScrollView>

        {/* Food List */}
        <FlatList
          data={filteredFoods}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.foodList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>😔</Text>
              <Text style={styles.emptyTitle}>No foods found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filter
              </Text>
            </View>
          }
        />

        {/* Food Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedFood && (
                <>
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                  
                  <Image
                    source={{ uri: selectedFood.image }}
                    style={styles.modalImage}
                  />
                  
                  <ScrollView style={styles.modalBody}>
                    <Text style={styles.modalName}>{selectedFood.name}</Text>
                    <Text style={styles.modalNameSi}>{selectedFood.nameSi}</Text>
                    <View style={styles.modalCategory}>
                      <Text style={styles.modalCategoryText}>{selectedFood.category}</Text>
                    </View>
                    
                    <Text style={styles.modalDescription}>{selectedFood.description}</Text>
                    
                    <View style={styles.modalStats}>
                      <View style={styles.modalStat}>
                        <Text style={styles.modalStatValue}>{selectedFood.calories}</Text>
                        <Text style={styles.modalStatLabel}>Calories</Text>
                      </View>
                      <View style={styles.modalStat}>
                        <Text style={styles.modalStatValue}>{selectedFood.protein}g</Text>
                        <Text style={styles.modalStatLabel}>Protein</Text>
                      </View>
                      <View style={styles.modalStat}>
                        <Text style={styles.modalStatValue}>{selectedFood.carbs}g</Text>
                        <Text style={styles.modalStatLabel}>Carbs</Text>
                      </View>
                      <View style={styles.modalStat}>
                        <Text style={styles.modalStatValue}>{selectedFood.fat}g</Text>
                        <Text style={styles.modalStatLabel}>Fat</Text>
                      </View>
                    </View>

                    <View style={styles.modalPoints}>
                      <View style={styles.modalGoodPoints}>
                        <Text style={styles.modalPointsTitle}>✅ Good Points</Text>
                        {selectedFood.goodPoints.map((point, index) => (
                          <Text key={index} style={styles.modalPointText}>• {point}</Text>
                        ))}
                      </View>
                      <View style={styles.modalBadPoints}>
                        <Text style={styles.modalPointsTitle}>⚠️ Bad Points</Text>
                        {selectedFood.badPoints.map((point, index) => (
                          <Text key={index} style={styles.modalPointText}>• {point}</Text>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
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

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
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
    marginTop: 6,
    marginLeft: 4,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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

  // Categories
  categoriesContainer: {
    marginTop: 14,
    marginBottom: 4,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // Food List
  foodList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  foodCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    marginHorizontal: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  foodImage: {
    width: '100%',
    height: 120,
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  foodNameSi: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
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
  foodCategory: {
    marginTop: 8,
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  foodCategoryText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },

  // Empty State
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

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalImage: {
    width: '100%',
    height: 220,
  },
  modalBody: {
    padding: 20,
  },
  modalName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  modalNameSi: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 2,
  },
  modalCategory: {
    marginTop: 8,
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  modalCategoryText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  modalDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 22,
    marginTop: 12,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  modalPoints: {
    marginTop: 16,
  },
  modalGoodPoints: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalBadPoints: {
    backgroundColor: '#FFEBEE',
    padding: 14,
    borderRadius: 12,
  },
  modalPointsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  modalPointText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 3,
  },
});