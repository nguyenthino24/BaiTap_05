require('dotenv').config();
const mysql = require('mysql2/promise');

const connection = async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_NAME || 'testdb'
    });

    console.log("✅ Connected to MySQL database");
    return conn;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1); // Dừng app nếu không kết nối được
  }
};

module.exports = connection;