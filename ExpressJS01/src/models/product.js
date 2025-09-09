const { pool } = require('./user');
const esClient = require('../config/elasticsearch');

// Khởi tạo bảng products
async function initializeProductTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2),
      discount_percentage INT DEFAULT 0,
      image_url VARCHAR(500),
      category_id INT,
      promotion BOOLEAN DEFAULT FALSE,
      views INT DEFAULT 0,
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

// Khởi tạo dữ liệu mẫu và đồng bộ với Elasticsearch
async function initializeSampleData() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    console.log('Current product count in MySQL:', rows[0].count);
    if (rows[0].count === 0) {
      const insertQuery = `
        INSERT INTO products (name, brand, price, original_price, discount_percentage, image_url, category_id, promotion) VALUES
        ('iPhone 15', 'Apple', 25000000, 28000000, 10, 'https://example.com/iphone15.jpg', 1, true),
        ('Samsung Galaxy S24', 'Samsung', 20000000, NULL, 0, 'https://example.com/galaxy.jpg', 1, false),
        ('MacBook Pro', 'Apple', 50000000, 55000000, 9, 'https://example.com/macbook.jpg', 2, true),
        ('Dell XPS 13', 'Dell', 35000000, NULL, 0, 'https://example.com/dell.jpg', 2, false);
      `;
      await pool.query(insertQuery);
      console.log('✅ Đã thêm dữ liệu mẫu cho bảng products.');

      const [newProducts] = await pool.query('SELECT * FROM products');
      for (const product of newProducts) {
        console.log('Syncing product:', product);
        const [categoryRows] = await pool.query("SELECT name AS category_name FROM categories WHERE id = ?", [product.category_id]);
        if (categoryRows.length === 0) {
          console.error(`❌ Không tìm thấy category với id ${product.category_id} cho product ${product.name}`);
          continue;
        }
        const category_name = categoryRows[0].name;

        await esClient.index({
          index: 'products',
          id: product.id.toString(),
          body: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: parseFloat(product.price),
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            discount_percentage: product.discount_percentage || 0,
            image_url: product.image_url,
            category_id: parseInt(product.category_id),
            category_name,
            promotion: product.promotion || false,
            views: product.views || 0
          }
        });
        console.log(`✅ Đã đồng bộ product ${product.name} vào Elasticsearch.`);
      }
      console.log('✅ Đã đồng bộ dữ liệu mẫu vào Elasticsearch.');
    } else {
      console.log('Dữ liệu mẫu đã tồn tại trong MySQL, bỏ qua chèn mới.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu mẫu products:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('Lỗi do bảng categories hoặc products không tồn tại.');
    }
  }
}

// Khởi tạo bảng và dữ liệu khi module được tải
initializeProductTable();
initializeSampleData();

async function getAllProducts() {
  const [rows] = await pool.query(
    `SELECT products.*, categories.name AS category_name
     FROM products
     LEFT JOIN categories ON products.category_id = categories.id`
  );
  return rows;
}

async function createProduct(name, brand, price, original_price, discount_percentage, image_url, category_id, promotion) {
  const [result] = await pool.query(
    `INSERT INTO products (name, brand, price, original_price, discount_percentage, image_url, category_id, promotion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, brand, price, original_price, discount_percentage, image_url, category_id, promotion]
  );

  const [categoryRows] = await pool.query("SELECT name AS category_name FROM categories WHERE id = ?", [category_id]);
  const category_name = categoryRows[0]?.category_name || null;

  await esClient.index({
    index: 'products',
    id: result.insertId.toString(),
    body: {
      id: result.insertId,
      name,
      brand,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      discount_percentage: discount_percentage || 0,
      image_url,
      category_id: parseInt(category_id),
      category_name,
      promotion: promotion || false,
      views: 0
    }
  });

  return { id: result.insertId, name, brand, price, original_price, discount_percentage, image_url, category_id, promotion };
}

async function getProductsWithCategories() {
  const [rows] = await pool.query(`
    SELECT p.id, p.name, p.brand, p.price, p.original_price, p.discount_percentage,
           p.image_url, p.promotion, p.views, c.name AS category_name
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