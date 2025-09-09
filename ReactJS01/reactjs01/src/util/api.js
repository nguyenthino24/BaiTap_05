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

// Thêm API tìm kiếm sản phẩm với filter (sử dụng MySQL)
const searchProductsApi = async (params = {}) => {
  try {
    const URL_API = '/v1/api/products/search'; // Đảm bảo khớp với /products/search
    // Thêm source=mysql để sử dụng MySQL thay vì Elasticsearch
    const searchParams = { ...params, source: 'mysql' };
    const response = await axios.get(URL_API, { params: searchParams });
    return response; // Fix: return response directly, not response.data
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
