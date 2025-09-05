const express = require('express');
const { createUser, handleLogin, getUser, getAccount } = require('../controllers/userController');
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

module.exports = routerAPI;