import axios from './axios.customize';

// Đăng ký
const createUserApi = (name, email, password) => {
  const URL_API = '/v1/api/register';
  const data = { name, email, password };
  return axios.post(URL_API, data);
};

// Đăng nhập
const loginApi = (email, password) => {
  const URL_API = '/v1/api/login';
  const data = { email, password };
  return axios.post(URL_API, data);
};

// Lấy thông tin người dùng (user profile)
const getUserApi = () => {
  const URL_API = '/v1/api/user';
  return axios.get(URL_API);
};

// ✅ Lấy danh sách tất cả sản phẩm kèm danh mục
const getProductsWithCategoryApi = () => {
  const URL_API = '/v1/api/products/with-category';
  return axios.get(URL_API);
};

// ✅ Lấy danh sách tất cả danh mục
const getAllCategoriesApi = () => {
  const URL_API = '/v1/api/categories';
  return axios.get(URL_API);
};

// Thêm API tìm kiếm sản phẩm với filter
const searchProductsApi = async (params = {}) => {
  try {
    const URL_API = '/v1/api/products/search'; // Đảm bảo khớp với /products/search
    const response = await axios.get(URL_API, { params });
    return response.data;
  } catch (error) {
    console.error('API search error:', error.response?.data || error.message);
    throw error;
  }
};

export {
  createUserApi,
  loginApi,
  getUserApi,
  getProductsWithCategoryApi,
  getAllCategoriesApi,
  searchProductsApi
};