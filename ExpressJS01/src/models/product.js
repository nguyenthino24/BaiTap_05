const { pool } = require('./user'); // Sử dụng pool từ models/user.js

// Khởi tạo bảng products
async function initializeProductTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      image_url VARCHAR(500),
      category_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log('✅ Bảng products đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('❌ Lỗi khi tạo bảng products:', error);
  }
}

// Khởi tạo bảng khi module được tải
initializeProductTable();

async function initializeSampleData() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      const insertQuery = `
        INSERT INTO products (name, brand, price, image_url, category_id) VALUES
        ('iPhone 15', 'Apple', 25000000, 'https://example.com/iphone15.jpg', 1),
        ('Samsung Galaxy S24', 'Samsung', 20000000, 'https://example.com/galaxy.jpg', 1),
        ('MacBook Pro', 'Apple', 50000000, 'https://example.com/macbook.jpg', 2),
        ('Dell XPS 13', 'Dell', 35000000, 'https://example.com/dell.jpg', 2);
      `;
      await pool.query(insertQuery);
      console.log('✅ Đã thêm dữ liệu mẫu cho bảng products.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu mẫu products:', error.message);
  }
}

initializeSampleData();

async function getAllProducts() {
  const [rows] = await pool.query(
    `SELECT products.*, categories.name AS category_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id`
  );
  return rows;
}

async function createProduct(name, brand, price, image_url, category_id) {
  const [result] = await pool.query(
    `INSERT INTO products (name, brand, price, image_url, category_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, brand, price, image_url, category_id]
  );
  return { id: result.insertId, name, brand, price, image_url, category_id };
}

async function getProductsWithCategories() {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.brand, p.price, p.image_url,
           c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY c.name, p.name
  `);
  return rows;
}

module.exports = {
  getAllProducts,
  createProduct,
  getProductsWithCategories
};
