export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  createdAt: Date | string;
}

export interface CarImage {
  id: string;
  carListingId: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface CarListing {
  id: string;
  createdById: string;
  createdBy?: User;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  plateNumber?: string;
  transmission: string;
  fuelType: string;
  bodyType?: string | null;
  seats?: number;
  color: string;
  previousOwners: number;
  location: string;
  description: string;
  features?: string;
  status: string;
  isVisible?: boolean;
  warrantyMonths: number;
  isCertified: boolean;
  viewsCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  images: CarImage[];
  favorites?: any[];
}

export interface SellSubmission {
  id: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  mileage: number;
  expectedPrice: number;
  city: string;
  description?: string | null;
  status: 'PENDING' | 'CONTACTED' | 'INSPECTING' | 'OFFERED' | 'ACCEPTED' | 'REJECTED';
  offerPrice?: number | null;
  notes?: string | null;
  createdAt: Date | string;
}

export interface TestDriveBooking {
  id: string;
  carListingId: string;
  carListing?: CarListing;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  bookingDate: string;
  bookingTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: Date | string;
}

export interface CarFilterState {
  search: string;
  brand: string;
  model: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  location: string;
  sellerType: string;
  sortBy: string;
}
