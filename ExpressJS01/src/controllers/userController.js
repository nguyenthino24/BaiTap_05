const { createUserService, loginService, getUserService } = require('../services/userService');

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const data = await createUserService(name, email, password);
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Tạo người dùng thất bại' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await loginService(email, password);
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Đăng nhập thất bại' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

const getAccount = async (req, res) => {
    try {
        const data = await getUserService();
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ message: 'Không tìm thấy tài khoản' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
const { getUserById } = require('../models/user');

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}



module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
};