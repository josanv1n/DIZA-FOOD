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
    
    // CRITICAL FIX: Mapping DB snake_case to Frontend camelCase
    // Database returns: user_id, total_amount, final_amount, payment_method
    // Frontend needs: userId, totalAmount, finalAmount, paymentMethod
    if (!Array.isArray(rawData)) return [];

    return rawData.map((row: any) => ({
      id: row.id,
      // Ensure date is string ISO format for comparison
      date: new Date(row.date).toISOString(), 
      userId: row.user_id, // FIX: Map from user_id
      totalAmount: row.total_amount, // FIX: Map from total_amount
      discount: row.discount || 0,
      finalAmount: row.final_amount, // FIX: Map from final_amount
      paymentMethod: row.payment_method, // FIX: Map from payment_method
      remark: row.remark,
      details: [] // Summary view usually doesn't need details, avoiding join complexity for now
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