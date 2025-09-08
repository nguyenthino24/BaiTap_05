const { pool } = require('./user'); // Sử dụng pool từ models/user.js

// Khởi tạo bảng categories
async function initializeCategoryTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Bảng categories đã được tạo hoặc đã tồn tại.');

    // Thêm dữ liệu mẫu nếu bảng trống
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (rows[0].count === 0) {
      const insertQuery = `
        INSERT INTO categories (name, description) VALUES
        ('Điện thoại', 'Các loại điện thoại di động'),
        ('Laptop', 'Máy tính xách tay'),
        ('Tablet', 'Máy tính bảng'),
        ('Phụ kiện', 'Phụ kiện công nghệ');
      `;
      await pool.query(insertQuery);
      console.log('✅ Đã thêm dữ liệu mẫu cho bảng categories.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng categories:', error.message);
    throw error; // Ném lỗi để backend báo rõ
  }
}

// Khởi tạo bảng khi module được tải
initializeCategoryTable();

async function getAllCategories() {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh mục:', error.message);
    throw error;
  }
}

async function createCategory(name, description) {
  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    return { id: result.insertId, name, description };
  } catch (error) {
    console.error('❌ Lỗi khi tạo danh mục:', error.message);
    throw error;
  }
}

async function getCategoryById(id) {
  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
    return rows[0];
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh mục theo ID:', error.message);
    throw error;
  }
}

async function updateCategory(id, name, description) {
  try {
    const [result] = await pool.query(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy danh mục');
    }
    return { id, name, description };
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật danh mục:', error.message);
    throw error;
  }
}

async function deleteCategory(id) {
  try {
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      throw new Error('Không tìm thấy danh mục');
    }
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi xóa danh mục:', error.message);
    throw error;
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};
