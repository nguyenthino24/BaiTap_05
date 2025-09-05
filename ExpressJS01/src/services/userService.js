require("dotenv").config();
const { pool } = require('../models/user'); // Giả sử pool được xuất từ models/user.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        // Kiểm tra người dùng đã tồn tại
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            console.log(`>>> user exist, chọn 1 email khác: ${email}`);
            return null;
        }

        // Hash mật khẩu
        const hashPassword = await bcrypt.hash(password, saltRounds);

        // Lưu người dùng vào cơ sở dữ liệu
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashPassword, 'user']
        );

        return { id: result.insertId, name, email, role: 'user' };
    } catch (error) {
        console.log(error);
        return null;
    }
};

const loginService = async (email, password) => {
    try {
        // Lấy người dùng theo email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (user) {
            // So sánh mật khẩu
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 1,
                    EM: "Email/Password không hợp lệ"
                };
            } else {
                // Tạo access token
                const payload = {
                    email: user.email,
                    name: user.name
                };

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );

                return {
                    EC: 0,
                    access_token,
                    user: {
                        email: user.email,
                        name: user.name
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hợp lệ"
            };
        }
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getUserService = async () => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role FROM users');
        return users; // Trả về mảng người dùng (loại bỏ password)
    } catch (error) {
        console.log(error);
        return null;
    }
};

module.exports = {
    createUserService,
    loginService,
    getUserService
};