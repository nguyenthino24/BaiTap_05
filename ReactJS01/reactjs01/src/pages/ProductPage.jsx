import React, { useState, useEffect } from 'react';
import axios from '../util/axios.customize.js';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    image_url: '',
    category_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Hàm fetch dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get('/v1/api/products/with-category'),
        axios.get('/v1/api/categories')
      ]);

      // Do axios instance trả trực tiếp data rồi → dùng luôn
      setProducts(Array.isArray(productResponse) ? productResponse : []);
      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
    } catch (err) {
      console.error('API error:', err);
      setError('Lỗi khi tải dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchData khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý submit form để thêm sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/v1/api/products', formData);
      setSuccess(response.message); // response đã là data

      // Fetch lại dữ liệu sau khi thêm thành công
      await fetchData();

      // Reset form
      setFormData({ name: '', brand: '', price: '', image_url: '', category_id: '' });
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Lỗi khi thêm sản phẩm');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Sản Phẩm</h1>

      {/* Form thêm sản phẩm */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Thêm Sản Phẩm Mới</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Tên sản phẩm"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="Thương hiệu"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Giá"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            placeholder="URL hình ảnh"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>Không có danh mục nào</option>
            )}
          </select>
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
            disabled={loading || categories.length === 0}
          >
            Thêm Sản Phẩm
          </button>
        </form>
      </div>

      {/* Trạng thái tải */}
      {loading && <p className="text-center text-gray-500 mt-4">Đang tải sản phẩm...</p>}

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && !loading && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Danh sách sản phẩm */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center">Chưa có sản phẩm nào.</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-600">Thương hiệu: {product.brand}</p>
                <p className="text-gray-600">Giá: {product.price} VND</p>
                <p className="text-gray-600">Danh mục: {product.category_name || 'Chưa có danh mục'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
