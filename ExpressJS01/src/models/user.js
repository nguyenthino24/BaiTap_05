const mysql = require('mysql2/promise'); // Sử dụng promise-based API

// Hàm kết nối MySQL (giả định đã cấu hình trong tệp khác)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Định nghĩa bảng Users trong MySQL
async function initializeTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    );
  `;
  try {
    const connection = await pool.getConnection();
    await connection.query(createTableQuery);
    connection.release();
    console.log('Bảng users đã được tạo hoặc đã tồn tại.');
  } catch (error) {
    console.error('Lỗi khi tạo bảng:', error);
  }
}

// Khởi tạo bảng khi module được tải
initializeTable();

// Xuất module để sử dụng
module.exports = {
  pool, // Xuất pool để sử dụng trong các file khác
  createUser: async (userData) => {
    const { name, email, password, role } = userData;
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(query, [name, email, password, role]);
      connection.release();
      return result.insertId; // Trả về ID của bản ghi vừa tạo
    } catch (error) {
      throw error;
    }
  },
  findUserByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query, [email]);
      connection.release();
      return rows[0] || null; // Trả về người dùng hoặc null nếu không tìm thấy
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (id) => {
    const query = 'SELECT id, name, email, role FROM users WHERE id = ?';
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(query, [id]);
      connection.release();
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

};