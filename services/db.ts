import { MenuItem, Transaction, User, PromoText, PaymentMethod } from '../types';

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
    try {
      const rawData = await this.request('getTransactions');
      
      if (!Array.isArray(rawData)) return [];

      // Robust mapping: Check for both snake_case (DB) and camelCase
      // Using explicit checks and fallbacks to 0 to prevent UI crashes
      return rawData.map((row: any) => {
        // Safe extraction helper
        const getNum = (val: any) => {
          const n = Number(val);
          return isNaN(n) ? 0 : n;
        };

        return {
          id: String(row.id || ''),
          date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(), 
          userId: String(row.user_id || row.userId || 'unknown'), 
          totalAmount: getNum(row.total_amount || row.totalAmount), 
          discount: getNum(row.discount),
          // Prioritize snake_case (DB), then camelCase, then 0. explicit undefined check.
          finalAmount: row.final_amount !== undefined ? getNum(row.final_amount) : getNum(row.finalAmount), 
          paymentMethod: (row.payment_method || row.paymentMethod || PaymentMethod.CASH) as PaymentMethod, 
          remark: String(row.remark || ''),
          details: [] 
        };
      });
    } catch (e) {
      console.error("Mapping error in getTransactions", e);
      return [];
    }
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