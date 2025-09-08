const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// Loại bỏ routerAPI.all("/*", auth) và áp dụng auth cho các route cụ thể
routerAPI.get('/', (req, res) => {
    return res.status(200).json('Hello world api');
});

routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

routerAPI.get('/user', auth, getUser); // Áp dụng auth cho route /user
routerAPI.get('/account', delay, getAccount); // Giữ delay cho /account

// Add product routes
routerAPI.get('/products', productController.getAllProducts);
routerAPI.post('/products', productController.createProduct);
routerAPI.get('/products/with-category', productController.getProductsWithCategories);

// Add category routes
routerAPI.get('/categories', categoryController.getAllCategories);
routerAPI.post('/categories', categoryController.createCategory);

module.exports = routerAPI;
