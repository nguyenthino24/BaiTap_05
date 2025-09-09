// routes/api.js
const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
const categoryRoutes = require('./category');
const productRoutes = require('./product');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();

// health
routerAPI.get('/', (req, res) => res.status(200).json('Hello world api'));

// auth
routerAPI.post('/register', createUser);
routerAPI.post('/login', handleLogin);

// protected
routerAPI.get('/user', auth, getUser);
routerAPI.get('/account', delay, getAccount);

// business
routerAPI.use('/products', productRoutes);    // /v1/api/products/...
routerAPI.use('/categories', categoryRoutes); // /v1/api/categories/...

module.exports = routerAPI;
