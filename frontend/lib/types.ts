export type Role = "CUSTOMER" | "VENDOR" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface Vendor {
  id: number;
  ownerId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  categories?: Category[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Food {
  id: number;
  vendorId: number;
  categoryId?: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isVeg: boolean;
  category?: Category;
}

export interface Review {
  id: number;
  userId: number;
  vendorId: number;
  rating: number;
  text?: string;
  createdAt: string;
  user?: { name: string; avatarUrl?: string };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    pagination: { totalItems: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean };
  };
}
