// app/(tabs)/marketplace/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../../constants/Colors';
import { marketplaceService } from '../../services/marketplaceService';
import { Product, Category, FilterOptions, CartItem } from '../../../types/marketplace.types';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../../../constants/marketplaceData';

const { width } = Dimensions.get('window');

// Storage Keys
const STORAGE_KEYS = {
  SHOPS: '@marketplace_shops',
  PRODUCTS: '@marketplace_products',
};

interface Shop {
  id: string;
  name: string;
  nameSi?: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distance: string;
  isOpen: boolean;
  ownerId: string;
  ownerName: string;
  description?: string;
  address?: string;
  phone?: string;
  products: Product[];
  createdAt: string;
}

const SAMPLE_SHOPS: Shop[] = [
  {
    id: 'shop1',
    name: 'Green Valley Organic',
    nameSi: 'ග්‍රීන් වැලි ඕගනික්',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    category: 'Organic Store',
    rating: 4.8,
    reviews: 256,
    deliveryTime: '30-45 min',
    distance: '2.5 km',
    isOpen: true,
    ownerId: 'user1',
    ownerName: 'Dr. Sunethra Perera',
    description: 'Fresh organic vegetables and fruits from local farms',
    address: '123, Galle Road, Colombo 03',
    phone: '0712345678',
    products: SAMPLE_PRODUCTS.slice(0, 4),
    createdAt: '2024-01-01',
  },
  {
    id: 'shop2',
    name: 'Fresh Farm Market',
    nameSi: 'ෆ්‍රෙෂ් ෆාම් මාර්කට්',
    image: 'https://images.unsplash.com/photo-1534723452862-4c8741d1a2d8?w=400',
    category: 'Farmers Market',
    rating: 4.6,
    reviews: 189,
    deliveryTime: '20-35 min',
    distance: '1.8 km',
    isOpen: true,
    ownerId: 'user1',
    ownerName: 'Dr. Kamal Fernando',
    description: 'Fresh produce directly from farmers',
    address: '45, Kandy Road, Colombo 07',
    phone: '0712345679',
    products: SAMPLE_PRODUCTS.slice(4, 8),
    createdAt: '2024-01-15',
  },
  {
    id: 'shop3',
    name: 'Healthy Bites Store',
    nameSi: 'හෙල්ති බයිට්ස් ස්ටෝර්',
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400',
    category: 'Health Food Store',
    rating: 4.9,
    reviews: 312,
    deliveryTime: '25-40 min',
    distance: '3.2 km',
    isOpen: false,
    ownerId: 'user2',
    ownerName: 'Dr. Nimal Rathnayake',
    description: 'Premium health foods and supplements',
    address: '78, Park Street, Colombo 02',
    phone: '0712345680',
    products: SAMPLE_PRODUCTS.slice(8, 12),
    createdAt: '2024-02-01',
  },
];

export default function MarketplaceScreen() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [viewMode, setViewMode] = useState<'products' | 'shops'>('shops');

  const [showCreateShop, setShowCreateShop] = useState(false);
  const [shopFormLoading, setShopFormLoading] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: '',
    nameSi: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    image: '',
    deliveryTime: '30-45 min',
    isOpen: true,
  });

  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedShopForFood, setSelectedShopForFood] = useState<Shop | null>(null);
  const [foodFormLoading, setFoodFormLoading] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: '',
    nameSi: '',
    description: '',
    category: '',
    price: '',
    unit: 'kg',
    image: '',
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    isOrganic: false,
    isLocal: false,
    isSeasonal: false,
    stock: '',
  });

  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    isOrganic: false,
    isLocal: false,
    isSeasonal: false,
    searchQuery: '',
  });

  useEffect(() => {
    loadData();
    loadCartCount();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const savedShops = await AsyncStorage.getItem(STORAGE_KEYS.SHOPS);
      let loadedShops: Shop[] = [];
      
      if (savedShops) {
        loadedShops = JSON.parse(savedShops);
      } else {
        loadedShops = SAMPLE_SHOPS;
        await AsyncStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(loadedShops));
      }

      const allProducts: Product[] = [];
      loadedShops.forEach(shop => {
        if (shop.products && shop.products.length > 0) {
          allProducts.push(...shop.products);
        }
      });

      setShops(loadedShops);
      setFilteredShops(loadedShops);
      setProducts(allProducts);
      setFilteredProducts(allProducts);

      try {
        const marketProducts = await marketplaceService.getAllProducts();
        if (marketProducts.length > 0) {
          setProducts(marketProducts);
          setFilteredProducts(marketProducts);
        }
      } catch (error) {
        console.log('Marketplace service not available');
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setShops(SAMPLE_SHOPS);
      setFilteredShops(SAMPLE_SHOPS);
    } finally {
      setLoading(false);
    }
  };

  const saveShopsToStorage = async (updatedShops: Shop[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(updatedShops));
    } catch (error) {
      console.error('Error saving shops:', error);
    }
  };

  const loadCartCount = async () => {
    try {
      const cart = await marketplaceService.getCart();
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartCount(0);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.nameSi && p.nameSi.toLowerCase().includes(q))
      );
    }

    if (filters.isOrganic) {
      filtered = filtered.filter(p => {
        const isOrganic = (p as any).isOrganic !== undefined ? (p as any).isOrganic : (p as any).is_organic;
        return isOrganic === true;
      });
    }

    if (filters.isLocal) {
      filtered = filtered.filter(p => {
        const isLocal = (p as any).isLocal !== undefined ? (p as any).isLocal : (p as any).is_local;
        return isLocal === true;
      });
    }

    if (filters.isSeasonal) {
      filtered = filtered.filter(p => {
        const isSeasonal = (p as any).isSeasonal !== undefined ? (p as any).isSeasonal : (p as any).is_seasonal;
        return isSeasonal === true;
      });
    }

    filtered = filtered.filter(p =>
      p.price >= filters.priceRange.min &&
      p.price <= filters.priceRange.max
    );

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterShops();
  }, [shopSearchQuery, shops]);

  const filterShops = () => {
    if (shopSearchQuery.trim()) {
      const query = shopSearchQuery.toLowerCase().trim();
      const filtered = shops.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        (shop.nameSi && shop.nameSi.toLowerCase().includes(query)) ||
        shop.category.toLowerCase().includes(query) ||
        shop.ownerName.toLowerCase().includes(query)
      );
      setFilteredShops(filtered);
    } else {
      setFilteredShops(shops);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const cart = await marketplaceService.getCart();
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        const newCartItem = {
          id: product.id,
          quantity: 1,
          name: product.name,
          price: product.price,
          image: product.image || (product as any).image_url || 'https://via.placeholder.com/80/4CAF50/FFFFFF?text=Food',
          unit: product.unit,
          description: product.description,
          category: product.category,
          isOrganic: product.isOrganic,
          isLocal: product.isLocal,
          isSeasonal: product.isSeasonal,
          seller: product.seller,
          available: product.available,
          stock: product.stock,
          rating: product.rating,
          reviews: product.reviews,
          tags: product.tags,
        };
        cart.push(newCartItem);
      }
      
      await marketplaceService.saveCart(cart);
      const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
      
      Alert.alert('✅ Added to Cart', `${product.name} added to your cart!`, [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(modals)/cart') }
      ]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const handleCreateShop = async () => {
    if (!shopForm.name.trim()) {
      Alert.alert('Error', 'Please enter shop name');
      return;
    }
    if (!shopForm.category.trim()) {
      Alert.alert('Error', 'Please enter shop category');
      return;
    }

    setShopFormLoading(true);

    try {
      const newShop: Shop = {
        id: `shop_${Date.now()}`,
        name: shopForm.name.trim(),
        nameSi: shopForm.nameSi.trim() || undefined,
        image: shopForm.image || 'https://via.placeholder.com/400/4CAF50/FFFFFF?text=Shop',
        category: shopForm.category.trim(),
        rating: 0,
        reviews: 0,
        deliveryTime: shopForm.deliveryTime || '30-45 min',
        distance: '0 km',
        isOpen: true,
        ownerId: 'user1',
        ownerName: 'Current User',
        description: shopForm.description.trim() || undefined,
        address: shopForm.address.trim() || undefined,
        phone: shopForm.phone.trim() || undefined,
        products: [],
        createdAt: new Date().toISOString(),
      };

      const updatedShops = [newShop, ...shops];
      setShops(updatedShops);
      setFilteredShops(updatedShops);
      await saveShopsToStorage(updatedShops);

      setShowCreateShop(false);
      setShopForm({
        name: '',
        nameSi: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        image: '',
        deliveryTime: '30-45 min',
        isOpen: true,
      });

      Alert.alert(
        '🎉 Shop Created!',
        `${newShop.name} has been created successfully!`,
        [
          {
            text: 'Add Products',
            onPress: () => {
              setSelectedShopForFood(newShop);
              setShowAddFood(true);
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );

    } catch (error) {
      console.error('Error creating shop:', error);
      Alert.alert('Error', 'Failed to create shop');
    } finally {
      setShopFormLoading(false);
    }
  };

  const handleAddFoodToShop = async () => {
    if (!selectedShopForFood) return;
    if (!foodForm.name.trim()) {
      Alert.alert('Error', 'Please enter food name');
      return;
    }
    if (!foodForm.price.trim()) {
      Alert.alert('Error', 'Please enter price');
      return;
    }

    setFoodFormLoading(true);

    try {
      const newProduct: Product = {
        id: `product_${Date.now()}`,
        name: foodForm.name.trim(),
        nameSi: foodForm.nameSi.trim() || undefined,
        description: foodForm.description.trim() || 'Fresh and healthy food',
        category: foodForm.category.trim() || 'Other',
        price: parseFloat(foodForm.price) || 0,
        unit: foodForm.unit || 'kg',
        image: foodForm.image || 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Food',
        nutrition: {
          calories: parseInt(foodForm.nutrition.calories as any) || 0,
          protein: parseInt(foodForm.nutrition.protein as any) || 0,
          carbs: parseInt(foodForm.nutrition.carbs as any) || 0,
          fat: parseInt(foodForm.nutrition.fat as any) || 0,
          fiber: parseInt(foodForm.nutrition.fiber as any) || 0,
        },
        isOrganic: foodForm.isOrganic || false,
        isLocal: foodForm.isLocal || false,
        isSeasonal: foodForm.isSeasonal || false,
        seller: {
          name: selectedShopForFood.name,
          location: selectedShopForFood.address || 'Unknown',
          rating: selectedShopForFood.rating,
        },
        available: true,
        stock: parseInt(foodForm.stock) || 0,
        rating: 0,
        reviews: 0,
        tags: [],
      };

      const updatedShops = shops.map(shop => {
        if (shop.id === selectedShopForFood.id) {
          return {
            ...shop,
            products: [...shop.products, newProduct],
          };
        }
        return shop;
      });

      setShops(updatedShops);
      setFilteredShops(updatedShops);
      await saveShopsToStorage(updatedShops);
      setProducts([newProduct, ...products]);

      Alert.alert('✅ Food Added!', `${newProduct.name} has been added!`);
      setFoodForm({
        name: '',
        nameSi: '',
        description: '',
        category: '',
        price: '',
        unit: 'kg',
        image: '',
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        isOrganic: false,
        isLocal: false,
        isSeasonal: false,
        stock: '',
      });
      setShowAddFood(false);
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food to shop');
    } finally {
      setFoodFormLoading(false);
    }
  };

  const pickImage = async (setImage: (url: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ===== RENDER FUNCTIONS =====

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#E53935', '#C62828']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🛒 Marketplace</Text>
          <TouchableOpacity 
            style={styles.cartBtn}
            onPress={() => router.push('/(modals)/cart')}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Fresh, healthy foods from local farmers</Text>
      </LinearGradient>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder={viewMode === 'shops' ? "Search shops..." : "Search products..."}
          placeholderTextColor="#94A3B8"
          value={viewMode === 'shops' ? shopSearchQuery : searchQuery}
          onChangeText={viewMode === 'shops' ? setShopSearchQuery : setSearchQuery}
        />
        {(viewMode === 'shops' ? shopSearchQuery : searchQuery).length > 0 && (
          <TouchableOpacity onPress={() => {
            if (viewMode === 'shops') setShopSearchQuery('');
            else setSearchQuery('');
          }}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'shops' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('shops')}
          >
            <Ionicons name="storefront-outline" size={18} color={viewMode === 'shops' ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'products' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('products')}
          >
            <Ionicons name="grid-outline" size={18} color={viewMode === 'products' ? '#FFFFFF' : '#64748B'} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.createShopBtn}
          onPress={() => setShowCreateShop(true)}
        >
          <Ionicons name="add-circle" size={24} color="#E53935" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#E53935" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterTitle}>Filters</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filters.isOrganic && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isOrganic: !filters.isOrganic })}
            >
              <Text style={[styles.filterChipText, filters.isOrganic && styles.filterChipTextActive]}>
                🌱 Organic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filters.isLocal && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isLocal: !filters.isLocal })}
            >
              <Text style={[styles.filterChipText, filters.isLocal && styles.filterChipTextActive]}>
                🇱🇰 Local
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, filters.isSeasonal && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, isSeasonal: !filters.isSeasonal })}
            >
              <Text style={[styles.filterChipText, filters.isSeasonal && styles.filterChipTextActive]}>
                📅 Seasonal
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterResetBtn}
            onPress={() => {
              setFilters({
                category: 'all',
                priceRange: { min: 0, max: 1000 },
                isOrganic: false,
                isLocal: false,
                isSeasonal: false,
                searchQuery: '',
              });
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.filterResetText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.categoryChipTextActive,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // ✅ Modern Shop Card
  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => {
        setSelectedShop(item);
        setShowShopModal(true);
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.shopImage} />
      <View style={styles.shopStatusBadge}>
        <View style={[styles.statusDot, { backgroundColor: item.isOpen ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.shopStatusText}>{item.isOpen ? 'Open' : 'Closed'}</Text>
      </View>
      
      <View style={styles.shopInfo}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.shopRating}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.shopRatingText}>{item.rating}</Text>
            <Text style={styles.shopReviews}>({item.reviews})</Text>
          </View>
        </View>
        
        <Text style={styles.shopCategory}>{item.category}</Text>
        {item.nameSi && (
          <Text style={styles.shopNameSi} numberOfLines={1}>{item.nameSi}</Text>
        )}
        
        <View style={styles.shopFooter}>
          <View style={styles.shopMeta}>
            <Ionicons name="time-outline" size={14} color="#94A3B8" />
            <Text style={styles.shopMetaText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.shopMeta}>
            <Ionicons name="location-outline" size={14} color="#94A3B8" />
            <Text style={styles.shopMetaText}>{item.distance}</Text>
          </View>
          <Text style={styles.shopProductCount}>{item.products.length} items</Text>
        </View>

        <View style={styles.shopOwnerBadge}>
          <Ionicons name="person-outline" size={12} color="#94A3B8" />
          <Text style={styles.shopOwnerText}>By {item.ownerName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ✅ Modern Product Card
  const renderProductCard = ({ item }: { item: Product }) => {
    const imageUrl = (item as any).image || (item as any).image_url || 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Food';
    const isOrganic = (item as any).isOrganic !== undefined ? (item as any).isOrganic : (item as any).is_organic;
    const isSeasonal = (item as any).isSeasonal !== undefined ? (item as any).isSeasonal : (item as any).is_seasonal;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push({
          pathname: '/(modals)/product-detail',
          params: { productId: item.id }
        })}
        activeOpacity={0.8}
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        {isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicBadgeText}>🌱 Organic</Text>
          </View>
        )}
        {isSeasonal && (
          <View style={[styles.organicBadge, styles.seasonalBadge]}>
            <Text style={styles.organicBadgeText}>📅 Seasonal</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          {item.nameSi && (
            <Text style={styles.productNameSi} numberOfLines={1}>{item.nameSi}</Text>
          )}
          <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>LKR {item.price}</Text>
              <Text style={styles.productUnit}>per {item.unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Modal render functions (same as before but with modern styling)
  const renderCreateShopModal = () => (
    <Modal
      visible={showCreateShop}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateShop(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>🏪 Create Shop</Text>
            <TouchableOpacity onPress={() => setShowCreateShop(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage((url) => setShopForm({ ...shopForm, image: url }))}
            >
              {shopForm.image ? (
                <Image source={{ uri: shopForm.image }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#94A3B8" />
                  <Text style={styles.imagePlaceholderText}>Add Shop Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Green Valley Organic"
                placeholderTextColor="#94A3B8"
                value={shopForm.name}
                onChangeText={(text) => setShopForm({ ...shopForm, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Name (Sinhala)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., ග්‍රීන් වැලි ඕගනික්"
                placeholderTextColor="#94A3B8"
                value={shopForm.nameSi}
                onChangeText={(text) => setShopForm({ ...shopForm, nameSi: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Organic Store, Farmers Market"
                placeholderTextColor="#94A3B8"
                value={shopForm.category}
                onChangeText={(text) => setShopForm({ ...shopForm, category: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Describe your shop..."
                placeholderTextColor="#94A3B8"
                value={shopForm.description}
                onChangeText={(text) => setShopForm({ ...shopForm, description: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Shop address"
                placeholderTextColor="#94A3B8"
                value={shopForm.address}
                onChangeText={(text) => setShopForm({ ...shopForm, address: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0712345678"
                placeholderTextColor="#94A3B8"
                value={shopForm.phone}
                onChangeText={(text) => setShopForm({ ...shopForm, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Delivery Time</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 30-45 min"
                placeholderTextColor="#94A3B8"
                value={shopForm.deliveryTime}
                onChangeText={(text) => setShopForm({ ...shopForm, deliveryTime: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Shop Status</Text>
              <View style={styles.statusToggle}>
                <TouchableOpacity
                  style={[styles.statusBtn, shopForm.isOpen && styles.statusBtnActive]}
                  onPress={() => setShopForm({ ...shopForm, isOpen: true })}
                >
                  <Text style={[styles.statusBtnText, shopForm.isOpen && styles.statusBtnTextActive]}>
                    🟢 Open
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusBtn, !shopForm.isOpen && styles.statusBtnActive]}
                  onPress={() => setShopForm({ ...shopForm, isOpen: false })}
                >
                  <Text style={[styles.statusBtnText, !shopForm.isOpen && styles.statusBtnTextActive]}>
                    🔴 Closed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, shopFormLoading && styles.submitBtnDisabled]}
              onPress={handleCreateShop}
              disabled={shopFormLoading}
            >
              {shopFormLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Create Shop</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const renderAddFoodModal = () => (
    <Modal
      visible={showAddFood}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddFood(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>
              🍽️ Add Food to {selectedShopForFood?.name || 'Shop'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddFood(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage((url) => setFoodForm({ ...foodForm, image: url }))}
            >
              {foodForm.image ? (
                <Image source={{ uri: foodForm.image }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color="#94A3B8" />
                  <Text style={styles.imagePlaceholderText}>Add Food Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Food Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Organic Carrots"
                placeholderTextColor="#94A3B8"
                value={foodForm.name}
                onChangeText={(text) => setFoodForm({ ...foodForm, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Food Name (Sinhala)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., කාබනික කැරට්"
                placeholderTextColor="#94A3B8"
                value={foodForm.nameSi}
                onChangeText={(text) => setFoodForm({ ...foodForm, nameSi: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Describe the food..."
                placeholderTextColor="#94A3B8"
                value={foodForm.description}
                onChangeText={(text) => setFoodForm({ ...foodForm, description: text })}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Category</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Vegetables"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.category}
                  onChangeText={(text) => setFoodForm({ ...foodForm, category: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Price *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.price}
                  onChangeText={(text) => setFoodForm({ ...foodForm, price: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="kg, g, piece"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.unit}
                  onChangeText={(text) => setFoodForm({ ...foodForm, unit: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Stock</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.stock}
                  onChangeText={(text) => setFoodForm({ ...foodForm, stock: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Nutrition (per 100g)</Text>
            <View style={styles.nutritionRow}>
              <View style={[styles.nutritionInput, { flex: 1 }]}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <TextInput
                  style={styles.nutritionField}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.nutrition.calories.toString()}
                  onChangeText={(text) => setFoodForm({
                    ...foodForm,
                    nutrition: { ...foodForm.nutrition, calories: parseInt(text) || 0 }
                  })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.nutritionInput, { flex: 1 }]}>
                <Text style={styles.nutritionLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.nutritionField}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.nutrition.protein.toString()}
                  onChangeText={(text) => setFoodForm({
                    ...foodForm,
                    nutrition: { ...foodForm.nutrition, protein: parseInt(text) || 0 }
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={[styles.nutritionInput, { flex: 1 }]}>
                <Text style={styles.nutritionLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.nutritionField}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.nutrition.carbs.toString()}
                  onChangeText={(text) => setFoodForm({
                    ...foodForm,
                    nutrition: { ...foodForm.nutrition, carbs: parseInt(text) || 0 }
                  })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.nutritionInput, { flex: 1 }]}>
                <Text style={styles.nutritionLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.nutritionField}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.nutrition.fat.toString()}
                  onChangeText={(text) => setFoodForm({
                    ...foodForm,
                    nutrition: { ...foodForm.nutrition, fat: parseInt(text) || 0 }
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.nutritionRow}>
              <View style={[styles.nutritionInput, { flex: 1 }]}>
                <Text style={styles.nutritionLabel}>Fiber (g)</Text>
                <TextInput
                  style={styles.nutritionField}
                  placeholder="0"
                  placeholderTextColor="#94A3B8"
                  value={foodForm.nutrition.fiber.toString()}
                  onChangeText={(text) => setFoodForm({
                    ...foodForm,
                    nutrition: { ...foodForm.nutrition, fiber: parseInt(text) || 0 }
                  })}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.nutritionInput, { flex: 1 }]} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tags</Text>
              <View style={styles.tagRow}>
                <TouchableOpacity
                  style={[styles.tagBtn, foodForm.isOrganic && styles.tagBtnActive]}
                  onPress={() => setFoodForm({ ...foodForm, isOrganic: !foodForm.isOrganic })}
                >
                  <Text style={[styles.tagBtnText, foodForm.isOrganic && styles.tagBtnTextActive]}>
                    🌱 Organic
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tagBtn, foodForm.isLocal && styles.tagBtnActive]}
                  onPress={() => setFoodForm({ ...foodForm, isLocal: !foodForm.isLocal })}
                >
                  <Text style={[styles.tagBtnText, foodForm.isLocal && styles.tagBtnTextActive]}>
                    🇱🇰 Local
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tagBtn, foodForm.isSeasonal && styles.tagBtnActive]}
                  onPress={() => setFoodForm({ ...foodForm, isSeasonal: !foodForm.isSeasonal })}
                >
                  <Text style={[styles.tagBtnText, foodForm.isSeasonal && styles.tagBtnTextActive]}>
                    📅 Seasonal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, foodFormLoading && styles.submitBtnDisabled]}
              onPress={handleAddFoodToShop}
              disabled={foodFormLoading}
            >
              {foodFormLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Add Food to Shop</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  const renderShopModal = () => {
    if (!selectedShop) return null;

    return (
      <Modal
        visible={showShopModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowShopModal(false)}>
                <Ionicons name="arrow-back" size={24} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>{selectedShop.name}</Text>
              <TouchableOpacity onPress={() => setShowShopModal(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedShop.image }} style={styles.modalShopImage} />
              
              <View style={styles.modalShopInfo}>
                <View style={styles.modalShopHeader}>
                  <View>
                    <Text style={styles.modalShopName}>{selectedShop.name}</Text>
                    {selectedShop.nameSi && (
                      <Text style={styles.modalShopNameSi}>{selectedShop.nameSi}</Text>
                    )}
                  </View>
                  <View style={[styles.modalStatusBadge, { backgroundColor: selectedShop.isOpen ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.modalStatusText, { color: selectedShop.isOpen ? '#4CAF50' : '#F44336' }]}>
                      {selectedShop.isOpen ? '● Open' : '● Closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalShopMeta}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.modalMetaText}>{selectedShop.rating}</Text>
                    <Text style={styles.modalMetaSub}>({selectedShop.reviews} reviews)</Text>
                  </View>
                  <View style={styles.modalMetaDivider} />
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="time-outline" size={16} color="#94A3B8" />
                    <Text style={styles.modalMetaText}>{selectedShop.deliveryTime}</Text>
                  </View>
                  <View style={styles.modalMetaDivider} />
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="location-outline" size={16} color="#94A3B8" />
                    <Text style={styles.modalMetaText}>{selectedShop.distance}</Text>
                  </View>
                </View>

                <Text style={styles.modalCategory}>{selectedShop.category}</Text>
                {selectedShop.description && (
                  <Text style={styles.modalDescription}>{selectedShop.description}</Text>
                )}
                {selectedShop.address && (
                  <Text style={styles.modalAddress}>
                    <Ionicons name="location-outline" size={14} color="#94A3B8" /> {selectedShop.address}
                  </Text>
                )}
                {selectedShop.phone && (
                  <Text style={styles.modalPhone}>
                    <Ionicons name="call-outline" size={14} color="#94A3B8" /> {selectedShop.phone}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.addFoodBtn}
                onPress={() => {
                  setShowShopModal(false);
                  setSelectedShopForFood(selectedShop);
                  setShowAddFood(true);
                }}
              >
                <LinearGradient
                  colors={['#E53935', '#C62828']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addFoodGradient}
                >
                  <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
                  <Text style={styles.addFoodBtnText}>Add Food to This Shop</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.modalProductsSection}>
                <Text style={styles.modalProductsTitle}>🛒 Products in this Shop</Text>
                {selectedShop.products.length === 0 ? (
                  <View style={styles.emptyProductsContainer}>
                    <Text style={styles.emptyProductsText}>No products yet</Text>
                    <Text style={styles.emptyProductsSub}>Add your first product!</Text>
                  </View>
                ) : (
                  selectedShop.products.map((product) => (
                    <View key={product.id} style={styles.modalProductItem}>
                      <Image 
                        source={{ uri: product.image || 'https://via.placeholder.com/60' }} 
                        style={styles.modalProductImage} 
                      />
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName}>{product.name}</Text>
                        <Text style={styles.modalProductDesc} numberOfLines={1}>{product.description}</Text>
                        <Text style={styles.modalProductPrice}>LKR {product.price}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.modalAddBtn}
                        onPress={() => {
                          handleAddToCart(product);
                          setShowShopModal(false);
                        }}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#E53935" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        
        <View style={styles.content}>
          {renderSearchBar()}
          
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Shops View */}
          {viewMode === 'shops' ? (
            <View style={styles.productsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏪 Nearby Shops</Text>
                <Text style={styles.sectionSubtitle}>{filteredShops.length} shops available</Text>
              </View>
              {filteredShops.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🏪</Text>
                  <Text style={styles.emptyTitle}>No Shops Found</Text>
                  <Text style={styles.emptyText}>
                    {shopSearchQuery ? 'Try adjusting your search' : 'Be the first to create a shop!'}
                  </Text>
                  {!shopSearchQuery && (
                    <TouchableOpacity
                      style={styles.clearFiltersBtn}
                      onPress={() => setShowCreateShop(true)}
                    >
                      <Text style={styles.clearFiltersText}>Create Your Shop</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredShops}
                  renderItem={renderShopCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.shopsGrid}
                />
              )}
            </View>
          ) : (
            <View style={styles.productsContainer}>
              {filteredProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🛒</Text>
                  <Text style={styles.emptyTitle}>No Products Found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your filters or search term
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                      setFilters({
                        category: 'all',
                        priceRange: { min: 0, max: 1000 },
                        isOrganic: false,
                        isLocal: false,
                        isSeasonal: false,
                        searchQuery: '',
                      });
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProductCard}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.productRow}
                  contentContainerStyle={styles.productsGrid}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {renderShopModal()}
      {renderCreateShopModal()}
      {renderAddFoodModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
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

  // Header
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 20,
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
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Search
  searchContainer: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    marginLeft: 10,
    paddingVertical: 0,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginRight: 4,
    padding: 2,
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewToggleBtnActive: {
    backgroundColor: '#E53935',
  },
  createShopBtn: {
    padding: 4,
    marginRight: 4,
  },
  filterBtn: {
    padding: 4,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  filterChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterResetBtn: {
    marginTop: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
  },

  // Categories
  categoriesContainer: {
    marginBottom: 12,
  },
  categoriesList: {
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
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },

  // Products Container
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  seasonalBadge: {
    left: 8,
    top: 36,
    backgroundColor: '#FF9800',
  },
  organicBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  productNameSi: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  productDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E53935',
  },
  productUnit: {
    fontSize: 10,
    color: '#94A3B8',
  },
  addToCartBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Shops
  shopsGrid: {
    paddingBottom: 20,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  shopImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  shopStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shopStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  shopInfo: {
    padding: 14,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  shopRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  shopReviews: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 2,
  },
  shopCategory: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '500',
    marginTop: 2,
  },
  shopNameSi: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  shopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopMetaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  shopProductCount: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  shopOwnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  shopOwnerText: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  modalShopImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  modalShopInfo: {
    padding: 16,
  },
  modalShopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalShopName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalShopNameSi: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalShopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalMetaDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E8ECF0',
  },
  modalMetaText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  modalMetaSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalCategory: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '500',
    marginTop: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18,
  },
  modalAddress: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  modalPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  modalProductsSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  modalProductsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  modalProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  modalProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  modalProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalProductDesc: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalProductPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E53935',
  },
  modalAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Add Food Button
  addFoodBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addFoodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addFoodBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty Products
  emptyProductsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyProductsSub: {
    fontSize: 13,
    color: '#BDBDBD',
    marginTop: 4,
  },

  // Form Styles
  modalForm: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E8ECF0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  imagePicker: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  statusToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  nutritionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  nutritionLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  nutritionField: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    padding: 0,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  tagBtnActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  tagBtnText: {
    fontSize: 13,
    color: '#64748B',
  },
  tagBtnTextActive: {
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  clearFiltersBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E53935',
    borderRadius: 10,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});