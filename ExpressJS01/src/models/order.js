const { pool } = require('./user');

async function initializeOrderTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT DEFAULT 1,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Bảng orders đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng orders:', error);
  }
}

async function createOrder(userId, productId, quantity = 1) {
  const insertQuery = `
    INSERT INTO orders (user_id, product_id, quantity)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await pool.query(insertQuery, [userId, productId, quantity]);
    return result.insertId;
  } catch (error) {
    console.error('❌ Lỗi khi tạo đơn hàng:', error);
    throw error;
  }
}

async function hasUserPurchasedProduct(userId, productId) {
  const query = `
    SELECT COUNT(*) AS count FROM orders
    WHERE user_id = ? AND product_id = ?
  `;
  try {
    const [rows] = await pool.query(query, [userId, productId]);
    return rows[0].count > 0;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra đơn hàng:', error);
    throw error;
  }
}

initializeOrderTable();

module.exports = {
  createOrder,
  hasUserPurchasedProduct,
};
