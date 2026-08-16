# 🍎 FitFood - Project Documentation

## 📋 Project Overview

**FitFood** is a comprehensive mobile nutrition management application built with Expo and React Native. It combines food scanning capabilities with meal planning, marketplace integration, and nutrition tracking to help users maintain a healthy lifestyle with a focus on local Sri Lankan cuisine.

---

## 🛠️ Technology Stack

### Frontend Framework
- **Expo** (v54.0.34) - Cross-platform mobile development framework
- **React** (v19.1.0) - UI library
- **React Native** (v0.81.5) - Native mobile framework
- **React DOM** (v19.1.0) - Web support
- **React Native Web** (~0.21.0) - Web platform support

### Navigation & UI
- **Expo Router** (~6.0.23) - File-based routing system
- **React Navigation** - Navigation library with multiple stack options
  - `@react-navigation/native` - Core navigation
  - `@react-navigation/bottom-tabs` (~7.18.5) - Bottom tab navigation
  - `@react-navigation/stack` (~7.10.6) - Stack navigation
  - `@react-navigation/elements` - Navigation elements

### State Management
- **Redux Toolkit** (~2.12.0) - State management
- **Redux** (via react-redux ~9.3.0) - Redux bindings for React
- **Redux Persist** (~6.0.0) - Persist Redux state to device storage

### Backend & Authentication
- **Supabase** (~2.110.0) - Backend-as-a-Service (PostgreSQL + Auth + Real-time)
- **Google Sign-In** (~16.1.2) - Google OAuth authentication
- **Expo Auth Session** (~7.0.11) - Auth flow handling
- **Expo Web Browser** (~15.0.11) - Web browser integration for OAuth

### AI & ML
- **Google Generative AI** (~0.24.1) - Gemini API for food recognition and analysis

### Camera & Media
- **Expo Camera** (~17.0.10) - Camera access for food scanning
- **React Native Vision Camera** (~5.0.11) - Advanced camera capabilities
- **Expo Image Picker** (~17.0.11) - Image selection
- **Expo Image** (~3.0.11) - Image component

### Data & Storage
- **AsyncStorage** (2.2.0) - Local device storage
- **Axios** (~1.18.1) - HTTP client for API requests

### Visualization & UI Components
- **React Native Chart Kit** (~7.0.1) - Charts for nutrition visualization
- **React Native SVG** (~15.15.5) - SVG support
- **Expo Linear Gradient** (~15.0.8) - Gradient backgrounds
- **Expo Symbols** (~1.0.8) - System symbols/icons

### UI/Icon Libraries
- **Expo Vector Icons** (~15.0.3) - Icon sets
- **React Native Vector Icons** (~10.3.0) - Additional icon support

### Utilities & Libraries
- **Expo Haptics** (~15.0.8) - Vibration/haptic feedback
- **Expo Constants** (~18.0.13) - App configuration access
- **Expo Linking** (~8.0.12) - Deep linking
- **React Native Gesture Handler** (~2.28.0) - Gesture recognition
- **React Native Reanimated** (~4.1.1) - Animation library
- **React Native Screens** (~4.16.0) - Native screen support
- **React Native Safe Area Context** (~5.6.0) - Safe area handling
- **React Native Worklets** (0.5.1) - Worklet support for animations
- **Expo Permissions** - Permissions handling

### Development Tools
- **TypeScript** (~5.9.2) - Type-safe development
- **ESLint** (~9.25.0) - Code linting
- **ESLint Config Expo** (~10.0.0) - Expo ESLint configuration

---

## 📁 Project Structure

```
FitFood/
├── app/                                    # Main application directory (Expo Router)
│   ├── index.tsx                          # Root home screen
│   ├── modal.tsx                          # Modal screen
│   ├── _layout.tsx                        # Root layout
│   ├── (auth)/                            # Authentication stack
│   │   ├── _layout.tsx
│   │   ├── login.tsx                      # Login screen
│   │   ├── register.tsx                   # Registration screen
│   │   └── splash.tsx                     # Splash screen
│   ├── (modals)/                          # Modal screens
│   │   ├── cart.tsx                       # Shopping cart modal
│   │   ├── checkout.tsx                   # Checkout modal
│   │   ├── product-detail.tsx             # Product details modal
│   │   └── recipes.tsx                    # Recipes modal
│   ├── (tabs)/                            # Tab-based navigation
│   │   ├── _layout.tsx                    # Tabs layout with bottom navigation
│   │   ├── home/
│   │   │   └── index.tsx                  # Home screen
│   │   ├── expert/
│   │   │   └── index.tsx                  # Expert consultation screen
│   │   ├── history/
│   │   │   └── index.tsx                  # Food scan history
│   │   ├── marketplace/
│   │   │   └── index.tsx                  # Marketplace screen
│   │   ├── meal-planner/
│   │   │   ├── index.tsx                  # Meal planner home
│   │   │   ├── create-meal.tsx            # Create meal screen
│   │   │   ├── favorites.tsx              # Favorite meals
│   │   │   ├── progress.tsx               # Progress tracking
│   │   │   ├── history.tsx                # Meal history
│   │   │   └── shopping-list.tsx          # Shopping list
│   │   ├── profile/
│   │   │   └── index.tsx                  # User profile
│   │   └── SLfood/                        # Sri Lankan Foods
│   │       ├── index.tsx                  # Foods list
│   │       ├── types.ts                   # Food type definitions
│   │       ├── add-food.tsx               # Add new food
│   │       └── components/
│   │           └── FoodDetailModal.tsx    # Food detail modal
│   ├── services/                          # API & business logic services
│   │   ├── expertService.ts               # Expert consultation API
│   │   ├── foodService.ts                 # Food database service
│   │   ├── marketplaceService.ts          # Marketplace API
│   │   ├── recipeService.ts               # Recipe API
│   │   └── meal-planner/
│   │       ├── mealPlannerService.ts      # Meal planning logic
│   │       ├── mealTemplates.ts           # Predefined meal templates
│   │       └── storageService.ts          # Local storage for meal plans
│   └── utils/
│       └── helpers.ts                     # Utility functions
├── src/
│   ├── context/
│   │   └── AuthContext.tsx                # Authentication context & provider
│   └── lib/
│       └── supabase.ts                    # Supabase client initialization
├── components/                            # Reusable UI components
│   ├── BottomNav.tsx                      # Custom bottom navigation
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/
│       ├── collapsible.tsx
│       ├── icon-symbol.ios.tsx
│       └── icon-symbol.tsx
├── types/                                 # TypeScript type definitions
│   ├── meal-planner.types.ts              # Meal planner interfaces
│   └── marketplace.types.ts               # Marketplace interfaces
├── constants/                             # App constants
│   ├── Colors.ts                          # Color palette
│   ├── marketplaceData.ts                 # Sample marketplace data
│   ├── recipeTypes.ts                     # Recipe type constants
│   └── theme.ts                           # Theme configuration
├── hooks/                                 # Custom React hooks
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
├── config/
│   └── env.ts                             # Environment configuration
├── assets/
│   └── images/                            # App images and icons
├── scripts/
│   └── reset-project.js                   # Project reset script
├── app.json                               # Expo configuration
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript configuration
├── eslint.config.js                       # ESLint configuration
├── expo-env.d.ts                          # Expo type definitions
├── README.md                              # Basic setup instructions
└── PROJECT_DOCUMENTATION.md               # This file
```

---

## 🎯 Features & Modules

### 1. **Authentication Module**
**Location:** `app/(auth)/*`, `src/context/AuthContext.tsx`

**Features:**
- Google OAuth authentication
- User registration
- Login/Logout functionality
- Session management with Supabase Auth
- Automatic route redirection based on auth state

**Key Components:**
- `AuthContext.tsx` - Authentication state management
- `login.tsx` - Login screen
- `register.tsx` - Registration screen
- `splash.tsx` - App splash screen

---

### 2. **Home Screen**
**Location:** `app/(tabs)/home/index.tsx`

**Features:**
- Dashboard overview
- Quick access to main features
- User greeting
- Daily nutrition summary

---

### 3. **Food Scanning Module**
**Location:** `app/(tabs)/SLfood/*`

**Features:**
- Camera-based food detection
- Food search and filtering
- Add foods to meal plan
- Nutrition information display
- Support for Sri Lankan food items
- Local food item database

**Types:**
- `types.ts` - Food type definitions with nutrition information

**Services:**
- `foodService.ts` - Database queries for breakfast, lunch, and dinner meals

**Database Tables:**
- `breakfast_meals`
- `lunch_meals`
- `dinner_meals`

---

### 4. **Meal Planner Module**
**Location:** `app/(tabs)/meal-planner/*`

**Features:**
- Create and manage daily meal plans
- Pre-built meal templates
- Nutrition goal tracking
- Shopping list generation
- Favorite meals management
- Progress tracking
- Meal reminders
- Water intake tracking
- Calorie and macro calculations

**Screens:**
- `index.tsx` - Main meal planner dashboard
- `create-meal.tsx` - Create new meal
- `favorites.tsx` - Favorite meals library
- `history.tsx` - Past meal plans
- `progress.tsx` - Nutrition progress charts
- `shopping-list.tsx` - Generated shopping list

**Services:**
- `mealPlannerService.ts` - Core meal planning logic
  - Create/update/delete meals
  - Calculate nutrition totals
  - Generate shopping lists
  - Manage templates
  - Goal tracking

- `mealTemplates.ts` - Predefined meal templates

- `storageService.ts` - Local storage operations
  - Save/retrieve meal plans
  - Persist nutrition goals
  - Manage templates locally

**Type Definitions:**
```typescript
- Meal - Individual meal with time, type, foods, nutrition
- DailyMealPlan - Complete day's meals with totals
- MealTemplate - Reusable meal patterns
- ShoppingItem - Shopping list items with categories
- MealReminder - Scheduled meal reminders
- NutritionGoal - Daily nutrition targets
```

---

### 5. **Marketplace Module**
**Location:** `app/(tabs)/marketplace/index.tsx`

**Features:**
- Browse food products
- Advanced filtering (organic, local, seasonal)
- Price range filtering
- Product search
- Shopping cart management
- Checkout functionality
- Product ratings and reviews
- Seller information
- Nutrition information for products

**Services:**
- `marketplaceService.ts` - Product management
  - Get all products
  - Filter by category/price/attributes
  - Search products
  - Manage shopping cart
  - Process orders

**Database Table:**
- `food_items` - Product inventory

**Type Definitions:**
```typescript
- Product - Food product with nutrition
- CartItem - Product with quantity
- Category - Product categories
- Order - Purchase orders
- FilterOptions - Search and filter criteria
```

---

### 6. **Food History Module**
**Location:** `app/(tabs)/history/index.tsx`

**Features:**
- View scanned food history
- Nutrition summary per scan
- Trend analysis
- Historical data access

---

### 7. **Expert Consultation Module**
**Location:** `app/(tabs)/expert/index.tsx`

**Features:**
- Chat with nutrition experts
- Get personalized recommendations
- Dietary advice

**Services:**
- `expertService.ts` - Expert consultation API

---

### 8. **Recipe Module**
**Location:** `app/(modals)/recipes.tsx`

**Features:**
- Browse recipes
- Recipe search
- Ingredients list
- Nutrition information

**Services:**
- `recipeService.ts` - Recipe management API

**Constants:**
- `recipeTypes.ts` - Recipe categories and types

---

### 9. **Profile Module**
**Location:** `app/(tabs)/profile/index.tsx`

**Features:**
- User profile management
- Nutrition goals setup
- Dietary preferences
- Health metrics
- Account settings

---

### 10. **Product Detail Modal**
**Location:** `app/(modals)/product-detail.tsx`

**Features:**
- Detailed product information
- Seller details and ratings
- Reviews and ratings
- Add to cart functionality
- Nutrition breakdown

---

### 11. **Shopping Cart Modal**
**Location:** `app/(modals)/cart.tsx`

**Features:**
- View cart items
- Update quantities
- Remove items
- View cart total
- Proceed to checkout

---

### 12. **Checkout Modal**
**Location:** `app/(modals)/checkout.tsx`

**Features:**
- Delivery address input
- Payment method selection
- Order summary
- Order confirmation

---

## 🔐 Backend Integration

### Supabase Configuration
**Location:** `src/lib/supabase.ts`, `config/env.ts`

**Capabilities:**
- PostgreSQL database
- Authentication (Google OAuth)
- Real-time subscriptions
- Row-level security

**Environment Variables Required:**
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_ENVIRONMENT=development|production
```

### Database Tables
1. **breakfast_meals** - Breakfast food items
2. **lunch_meals** - Lunch food items
3. **dinner_meals** - Dinner food items
4. **food_items** - Marketplace products
5. **users** - User profiles
6. **orders** - Order history

---

## 🤖 AI Integration

### Google Gemini API
**Purpose:** Food recognition from images

**Features:**
- Analyze food images
- Identify food types
- Extract nutrition data
- Provide dietary recommendations

**Implementation:**
- Configured in `config/env.ts`
- API key from app.json `extra.geminiApiKey`

---

## 🎨 UI & Styling

### Theme System
**Location:** `constants/theme.ts`, `constants/Colors.ts`

**Features:**
- Dark/Light mode support
- Custom color palette
- Consistent styling

### Custom Hooks
- `use-color-scheme.ts` - Color scheme detection
- `use-theme-color.ts` - Theme color management

### Reusable Components
- **BottomNav** - Custom bottom navigation bar
- **ThemedText** - Text with theme support
- **ThemedView** - View with theme support
- **Collapsible** - Expandable sections
- **ParallaxScrollView** - Parallax scroll effect
- **HapticTab** - Haptic feedback on tab press

---

## 📊 Data Types & Interfaces

### Meal Planner Types
```typescript
interface Meal {
  id: string;
  name: string;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  preparationTime?: number;
  recipe?: string;
  isFavorite?: boolean;
  notes?: string;
  completed: boolean;
}

interface DailyMealPlan {
  id: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  caloriesGoal: number;
  notes?: string;
}

interface NutritionGoal {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  waterGoal: number;
}
```

### Marketplace Types
```typescript
interface Product {
  id: string;
  name: string;
  nameSi?: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  isOrganic: boolean;
  isLocal: boolean;
  isSeasonal: boolean;
  seller: {
    name: string;
    location: string;
    rating: number;
  };
  available: boolean;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
  deliveryAddress: string;
  paymentMethod: string;
}
```

---

## 🚀 Build & Deployment

### Available Commands
```bash
# Installation
npm install

# Development
npm start              # Start Expo development server
npx expo start --android    # Start for Android
npx expo start --ios        # Start for iOS
npx expo start --web        # Start for web

# Linting
npm run lint          # Run ESLint

# Reset Project
npm run reset-project # Reset to blank project
```

### Configuration
- **Android:** Edge-to-edge enabled, adaptive icon with foreground/background images
- **iOS:** Tablet support enabled
- **Web:** Static output, favicon configured
- **New Architecture:** React Native New Architecture enabled
- **TypedRoutes:** Expo Router typed routes enabled
- **React Compiler:** Enabled for optimized rendering

---

## 🔌 Plugins & Integrations

### Expo Plugins
1. **expo-router** - File-based routing
2. **expo-splash-screen** - Custom splash screen
3. **@react-native-google-signin/google-signin** - Google authentication
4. **expo-web-browser** - Web browser for OAuth flow

---

## 📱 Platform Support

- **iOS** - Full support with tablet optimization
- **Android** - Full support with edge-to-edge display
- **Web** - Full support with static output

---

## 🔒 Security Features

- **OAuth 2.0** - Secure Google authentication
- **Supabase Auth** - Backend authentication
- **Row-Level Security** - Database-level access control
- **Environment Variables** - Secure API key management
- **Redux Persist** - Secure local state persistence

---

## 📈 Performance Features

- **React Native Reanimated** - Smooth 60fps animations
- **Vision Camera** - Optimized real-time camera processing
- **React Native Worklets** - Native thread processing
- **Chart Kit** - Efficient chart rendering
- **Redux Persist** - Optimized state management

---

## 🌍 Localization Support

- **English Support** - Primary language
- **Sinhala Support** - `nameSi` fields for Sinhala translations
- **Multi-language Ready** - Architecture supports expansion

---

## 📝 Development Notes

### Current Configuration
- **Expo Version:** 54.0.34
- **React Version:** 19.1.0
- **TypeScript:** 5.9.2
- **Node Package Manager:** npm

### File-Based Routing
The app uses Expo Router's file-based routing system where:
- Files in `app/` directory automatically become routes
- Folders with parentheses `()` are non-route groups
- `_layout.tsx` files define layout structure
- Dynamic routes use `[param]` syntax

### State Management
- **Redux Toolkit** for global state
- **Redux Persist** for state persistence
- **AsyncStorage** for local storage
- **Supabase Realtime** for backend synchronization

---

## 🎯 Future Enhancement Opportunities

1. Push notifications for meal reminders
2. Social features (share meals, follow users)
3. Advanced AI nutrition recommendations
4. Integration with wearable devices
5. Barcode scanning for quick product lookup
6. Advanced recipe suggestions based on available ingredients
7. Community food sharing features
8. Integration with popular fitness trackers
9. Multi-language support enhancement
10. Offline mode with sync capabilities

---

## 📞 Support & Resources

### Documentation Links
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Router Docs](https://expo.dev/router)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)

---

**Project Version:** 1.0.0  
**Last Updated:** 2026-08-15  
**Status:** Active Development
