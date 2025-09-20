const userModel = require('./user');
const pool = userModel.pool;

async function initializeCommentTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      comment_text TEXT NOT NULL,
      comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Bảng comments đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng comments:', error);
  }
}

async function createComment(userId, productId, commentText) {
  const insertQuery = `
    INSERT INTO comments (user_id, product_id, comment_text)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await pool.query(insertQuery, [userId, productId, commentText]);
    return result.insertId;
  } catch (error) {
    console.error('❌ Lỗi khi tạo bình luận:', error);
    throw error;
  }
}

async function getCommentsByProduct(productId) {
  try {
    console.log(`📝 Đang lấy bình luận cho sản phẩm ${productId}`);

    const query = `
      SELECT c.id, c.user_id, c.product_id, c.comment_text, c.comment_date,
             u.name AS user_name, u.email AS user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.product_id = ?
      ORDER BY c.comment_date DESC
    `;

    const [rows] = await pool.query(query, [productId]);
    console.log(`✅ Tìm thấy ${rows.length} bình luận cho sản phẩm ${productId}`);
    return rows;
  } catch (error) {
    console.error('❌ Lỗi khi lấy bình luận:', error);
    throw error;
  }
}

// Thêm function để lấy thống kê bình luận
async function getCommentStats(productId) {
  try {
    const query = `
      SELECT
        COUNT(*) as total_comments,
        COUNT(DISTINCT c.user_id) as unique_commenters
      FROM comments c
      WHERE c.product_id = ?
    `;
    const [rows] = await pool.query(query, [productId]);
    return rows[0];
  } catch (error) {
    console.error('❌ Lỗi khi lấy thống kê bình luận:', error);
    throw error;
  }
}

initializeCommentTable();

module.exports = {
  createComment,
  getCommentsByProduct,
  getCommentStats,
};
