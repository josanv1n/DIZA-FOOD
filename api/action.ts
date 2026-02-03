import { Pool } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // Allow simple CORS for demo purposes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action, payload } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const client = await pool.connect();
    let result;

    switch (action) {
      case 'getMenu':
        result = await client.query('SELECT * FROM menu ORDER BY name ASC');
        res.json(result.rows);
        break;

      case 'addMenu':
        const { name, category, price } = payload;
        const newId = Date.now().toString();
        await client.query(
          'INSERT INTO menu (id, name, category, price) VALUES ($1, $2, $3, $4)',
          [newId, name, category, price]
        );
        res.json({ id: newId, name, category, price });
        break;

      case 'login':
        const { username, pin } = payload;
        const userRes = await client.query(
          'SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND pin = $2',
          [username, pin]
        );
        if (userRes.rows.length > 0) {
          const user = userRes.rows[0];
          // Log Login
          await client.query(
            'INSERT INTO login_logs (id, user_id, timestamp) VALUES ($1, $2, NOW())',
            [`log-${Date.now()}`, user.id]
          );
          res.json(user);
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
        break;

      case 'getPromo':
        const promoRes = await client.query('SELECT * FROM promo LIMIT 1');
        res.json(promoRes.rows[0] || { content: '', active: false });
        break;

      case 'updatePromo':
        await client.query('UPDATE promo SET content = $1 WHERE id = $2', [payload.content, 'p1']);
        // If not exists insert (upsert logic simplified)
        if ((await client.query('SELECT * FROM promo WHERE id = $1', ['p1'])).rowCount === 0) {
             await client.query('INSERT INTO promo (id, content, active) VALUES ($1, $2, $3)', ['p1', payload.content, true]);
        }
        res.json({ success: true });
        break;

      case 'getTransactions':
        const txRes = await client.query('SELECT * FROM transactions ORDER BY date DESC LIMIT 100');
        res.json(txRes.rows);
        break;

      case 'createTransaction':
        const { userId, totalAmount, discount, finalAmount, paymentMethod, remark, details } = payload;
        const txId = `TX-${Date.now()}`;
        
        await client.query('BEGIN');
        
        await client.query(
          `INSERT INTO transactions 
          (id, user_id, total_amount, discount, final_amount, payment_method, remark, date) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [txId, userId, totalAmount, discount, finalAmount, paymentMethod, remark]
        );

        for (const item of details) {
          await client.query(
            `INSERT INTO transaction_details 
            (transaction_id, menu_id, menu_name, price, quantity, subtotal) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [txId, item.menuId, item.menuName, item.price, item.quantity, item.subtotal]
          );
        }

        await client.query('COMMIT');
        res.json({ id: txId, success: true });
        break;

      default:
        res.status(400).json({ message: 'Unknown action' });
    }
    client.release();

  } catch (error: any) {
    console.error('Database Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}