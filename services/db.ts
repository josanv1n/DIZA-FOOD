import { MenuItem, Transaction, User, PromoText } from '../types';

// API Base URL (Relative path works because frontend and backend are on same domain)
const API_URL = '/api/action';

class NeonService {
  
  private async request(action: string, payload?: any) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
      throw error;
    }
  }

  // --- Menu Operations ---
  async getMenu(): Promise<MenuItem[]> {
    return this.request('getMenu');
  }

  async addMenu(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return this.request('addMenu', item);
  }

  // --- Transaction Operations ---
  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
    return this.request('createTransaction', tx);
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.request('getTransactions');
  }

  // --- Promo Operations ---
  async getPromo(): Promise<PromoText> {
    return this.request('getPromo');
  }

  async updatePromo(text: string): Promise<void> {
    return this.request('updatePromo', { content: text });
  }

  // --- Auth & Users ---
  async login(username: string, pin: string): Promise<User | null> {
    try {
      const user = await this.request('login', { username, pin });
      return user;
    } catch (e) {
      return null;
    }
  }
}

export const db = new NeonService();