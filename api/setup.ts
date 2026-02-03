import { Pool } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const client = await pool.connect();

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        pin TEXT NOT NULL
      );
    `);

    // 2. Create Menu Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL
      );
    `);

    // 3. Create Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        discount INTEGER DEFAULT 0,
        final_amount INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        remark TEXT
      );
    `);

    // 4. Create Transaction Details Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transaction_details (
        id SERIAL PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        menu_id TEXT NOT NULL,
        menu_name TEXT NOT NULL,
        price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal INTEGER NOT NULL
      );
    `);

    // 5. Create Promo Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS promo (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT TRUE
      );
    `);

    // 6. Create Login Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // --- SEED INITIAL DATA IF EMPTY ---

    // Seed Users
    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO users (id, username, role, pin) VALUES
        ('u1', 'kasir', 'USER', '1234'),
        ('u2', 'admin', 'ADMIN', 'admin'),
        ('u3', 'manager', 'MANAGER', 'boss');
      `);
    }

    // Seed Menu
    const menuCheck = await client.query('SELECT COUNT(*) FROM menu');
    if (parseInt(menuCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO menu (id, name, category, price) VALUES
        ('1', 'Pop Ice', 'MINUMAN', 5000),
        ('2', 'Kopi', 'MINUMAN', 5000),
        ('3', 'Teh', 'MINUMAN', 5000),
        ('4', 'Batagor', 'MAKANAN', 10000),
        ('5', 'Siomay', 'MAKANAN', 10000),
        ('6', 'Ayam Geprek', 'MAKANAN', 10000),
        ('7', 'Indomie (Tanpa Telur)', 'MAKANAN', 8000),
        ('8', 'Indomie (Pakai Telur)', 'MAKANAN', 10000);
      `);
    }

    // Seed Promo
    const promoCheck = await client.query('SELECT COUNT(*) FROM promo');
    if (parseInt(promoCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO promo (id, content, active) VALUES
        ('p1', 'PROMO HARI INI: BELI 5 AYAM GEPREK GRATIS ES TEH!', true);
      `);
    }

    client.release();
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'Database tables created and initial data seeded successfully.' 
    });

  } catch (error: any) {
    console.error('Database setup failed:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Setup failed', 
      error: error.message 
    });
  }
}