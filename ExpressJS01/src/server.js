// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const { getHomepage } = require('./controllers/homeController.js');
const { pool } = require('./models/user'); // dùng pool thống nhất

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

// web pages
const webAPI = express.Router();
webAPI.get('/', getHomepage);
app.use('/', webAPI);

// REST API
app.use('/v1/api', apiRoutes);

// Khởi tạo bảng favorites
const { initializeFavoriteTable } = require('./models/favorite');

// Khởi động sau khi kiểm tra kết nối DB
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL Database connected!');

    // Khởi tạo bảng favorites
    await initializeFavoriteTable();

    app.listen(port, () => console.log(`🚀 Backend Nodejs App listening on port ${port}`));
  } catch (error) {
    console.log('❌ Error connect to DB:', error);
    process.exit(1);
  }
})();
