import axios from './axios.customize';

// Đăng ký
const createUserApi = (name, email, password) => {
    const URL_API = "/v1/api/register";
    const data = { name, email, password };
    return axios.post(URL_API, data);
};

// Đăng nhập
const loginApi = (email, password) => {
    const URL_API = "/v1/api/login";
    const data = { email, password };
    return axios.post(URL_API, data);
};

// Lấy thông tin người dùng (user profile)
const getUserApi = () => {
    const URL_API = "/v1/api/user";
    return axios.get(URL_API);
};

// ✅ Lấy danh sách tất cả sản phẩm kèm danh mục
const getProductsWithCategoryApi = () => {
    const URL_API = "/v1/api/products/with-category";
    return axios.get(URL_API);
};

// ✅ Lấy danh sách tất cả danh mục
const getAllCategoriesApi = () => {
    const URL_API = "/v1/api/categories";
    return axios.get(URL_API);
};

export {
    createUserApi,
    loginApi,
    getUserApi,
    getProductsWithCategoryApi,
    getAllCategoriesApi
};
