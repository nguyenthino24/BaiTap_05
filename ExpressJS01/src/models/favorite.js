const { pool } = require('./user');

// Khởi tạo bảng favorites
async function initializeFavoriteTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_favorite (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Bảng favorites đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng favorites:', error);
  }
}

// Khởi tạo bảng khi module được tải - moved to controller

async function addFavorite(userId, productId) {
  try {
    const query = 'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)';
    await pool.query(query, [userId, productId]);
    return true;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return false; // Đã tồn tại favorite
    }
    throw error;
  }
}

async function removeFavorite(userId, productId) {
  const query = 'DELETE FROM favorites WHERE user_id = ? AND product_id = ?';
  const [result] = await pool.query(query, [userId, productId]);
  return result.affectedRows > 0;
}

async function getFavoritesByUser(userId) {
  const query = `
    SELECT p.*
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE f.user_id = ?
  `;
  const [rows] = await pool.query(query, [userId]);
  return rows;
}

exports.addFavorite = addFavorite;
exports.removeFavorite = removeFavorite;
exports.getFavoritesByUser = getFavoritesByUser;
exports.initializeFavoriteTable = initializeFavoriteTable;
