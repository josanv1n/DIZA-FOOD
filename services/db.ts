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
    const rawData = await this.request('getTransactions');
    
    if (!Array.isArray(rawData)) return [];

    // Robust mapping: Check for both snake_case (DB) and camelCase (potential API change)
    // Default to 0 or safe strings to prevent UI crashes
    return rawData.map((row: any) => ({
      id: row.id,
      date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(), 
      userId: row.user_id || row.userId || 'unknown', 
      totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0), 
      discount: Number(row.discount ?? 0),
      finalAmount: Number(row.final_amount ?? row.finalAmount ?? 0), 
      paymentMethod: row.payment_method || row.paymentMethod || 'UNKNOWN', 
      remark: row.remark || '',
      details: [] 
    }));
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