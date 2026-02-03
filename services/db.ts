import { MenuItem, Transaction, User, UserRole, PromoText, LoginLog } from '../types';

// Initial Seed Data
const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Pop Ice', category: 'MINUMAN', price: 5000 },
  { id: '2', name: 'Kopi', category: 'MINUMAN', price: 5000 },
  { id: '3', name: 'Teh', category: 'MINUMAN', price: 5000 },
  { id: '4', name: 'Batagor', category: 'MAKANAN', price: 10000 },
  { id: '5', name: 'Siomay', category: 'MAKANAN', price: 10000 },
  { id: '6', name: 'Ayam Geprek', category: 'MAKANAN', price: 10000 },
  { id: '7', name: 'Indomie (Tanpa Telur)', category: 'MAKANAN', price: 8000 },
  { id: '8', name: 'Indomie (Pakai Telur)', category: 'MAKANAN', price: 10000 },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'kasir', role: UserRole.USER, pin: '1234' },
  { id: 'u2', username: 'admin', role: UserRole.ADMIN, pin: 'admin' },
  { id: 'u3', username: 'manager', role: UserRole.MANAGER, pin: 'boss' },
];

const INITIAL_PROMO: PromoText = {
  id: 'p1',
  content: "PROMO HARI INI: BELI 5 AYAM GEPREK GRATIS ES TEH!",
  active: true
};

// Simulated Database Keys
const DB_KEYS = {
  MENU: 'diza_menu',
  USERS: 'diza_users',
  TRANSACTIONS: 'diza_transactions',
  PROMO: 'diza_promo',
  LOGS: 'diza_login_logs'
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class NeonService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(DB_KEYS.MENU)) {
      localStorage.setItem(DB_KEYS.MENU, JSON.stringify(INITIAL_MENU));
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
      localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.PROMO)) {
      localStorage.setItem(DB_KEYS.PROMO, JSON.stringify(INITIAL_PROMO));
    }
    if (!localStorage.getItem(DB_KEYS.LOGS)) {
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify([]));
    }
  }

  // --- Menu Operations ---
  async getMenu(): Promise<MenuItem[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(DB_KEYS.MENU) || '[]');
  }

  async addMenu(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    await delay(300);
    const menus = await this.getMenu();
    const newItem = { ...item, id: Date.now().toString() };
    menus.push(newItem);
    localStorage.setItem(DB_KEYS.MENU, JSON.stringify(menus));
    return newItem;
  }

  // --- Transaction Operations ---
  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    await delay(500);
    const transactions = await this.getTransactions();
    const newTx = { ...tx, id: `TX-${Date.now()}` };
    transactions.push(newTx);
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  }

  async getTransactions(): Promise<Transaction[]> {
    await delay(300);
    return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || '[]');
  }

  // --- Promo Operations ---
  async getPromo(): Promise<PromoText> {
    await delay(200);
    return JSON.parse(localStorage.getItem(DB_KEYS.PROMO) || '{}');
  }

  async updatePromo(text: string): Promise<void> {
    await delay(300);
    const promo: PromoText = { id: 'p1', content: text, active: true };
    localStorage.setItem(DB_KEYS.PROMO, JSON.stringify(promo));
  }

  // --- Auth & Users ---
  async login(username: string, pin: string): Promise<User | null> {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin);
    
    if (user) {
      this.logLogin(user.id);
      return user;
    }
    return null;
  }

  private logLogin(userId: string) {
    const logs: LoginLog[] = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    logs.push({
      id: Date.now().toString(),
      userId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  }
}

export const db = new NeonService();