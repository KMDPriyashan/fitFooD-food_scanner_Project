export interface Product {
  id: string;
  name: string;
  nameSi?: string;
  description: string;
  category: string;
  price: number;
  unit: string; // kg, g, piece, bunch, etc.
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

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  nameSi?: string;
  icon: string;
  count: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: Date;
  deliveryAddress: string;
  paymentMethod: string;
}

export interface FilterOptions {
  category: string;
  priceRange: { min: number; max: number };
  isOrganic: boolean;
  isLocal: boolean;
  isSeasonal: boolean;
  searchQuery: string;
}