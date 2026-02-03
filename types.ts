export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  pin: string; // Simple PIN for demo login
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'MAKANAN' | 'MINUMAN';
  price: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  QRIS = 'QRIS'
}

export interface TransactionDetail {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  userId: string; // Cashier
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  remark?: string; // For Transfer/QRIS ref or notes
  details: TransactionDetail[];
}

export interface PromoText {
  id: string;
  content: string;
  active: boolean;
}

export interface LoginLog {
  id: string;
  userId: string;
  timestamp: string;
}