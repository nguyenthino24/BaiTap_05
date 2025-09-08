import React, { useState, useEffect } from 'react';
import axios from '../util/axios.customize.js';
import { searchProductsApi } from '../util/api.js';

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
  const [searchForm, setSearchForm] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    promotion: '',
    minViews: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

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

  // Xử lý thay đổi input trong search form
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm({ ...searchForm, [name]: value });
  };

  // Xử lý tìm kiếm
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError('');

    try {
      const params = {};
      if (searchForm.query) params.query = searchForm.query;
      if (searchForm.category) params.category = searchForm.category;
      if (searchForm.minPrice) params.minPrice = searchForm.minPrice;
      if (searchForm.maxPrice) params.maxPrice = searchForm.maxPrice;
      if (searchForm.promotion) params.promotion = searchForm.promotion;
      if (searchForm.minViews) params.minViews = searchForm.minViews;

      const response = await searchProductsApi(params);
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Lỗi khi tìm kiếm: ' + (err.message || 'Unknown error'));
    } finally {
      setSearching(false);
    }
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchForm({
      query: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      promotion: '',
      minViews: ''
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🛍️ Quản Lý Sản Phẩm
          </h1>
          <p className="text-gray-600">Quản lý và tìm kiếm sản phẩm của bạn</p>
        </div>

        {/* Form thêm sản phẩm */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">➕</span> Thêm Sản Phẩm Mới
            </h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <p className="text-green-700">{success}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">📦 Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên sản phẩm"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">🏷️ Thương hiệu</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Nhập thương hiệu"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">💰 Giá (VND)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Nhập giá sản phẩm"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">🖼️ URL hình ảnh</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Nhập URL hình ảnh"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">📂 Danh mục</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                >
                  <option value="">Chọn danh mục sản phẩm</option>
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
              </div>
              <div className="md:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || categories.length === 0}
                >
                  {loading ? '⏳ Đang xử lý...' : '✨ Thêm Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Form tìm kiếm sản phẩm */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">🔍</span> Tìm Kiếm Sản Phẩm
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">🔤 Từ khóa</label>
                <input
                  type="text"
                  name="query"
                  value={searchForm.query}
                  onChange={handleSearchChange}
                  placeholder="Nhập từ khóa tìm kiếm"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">📂 Danh mục</label>
                <select
                  name="category"
                  value={searchForm.category}
                  onChange={handleSearchChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Tất cả danh mục</option>
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
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">💰 Giá tối thiểu</label>
                <input
                  type="number"
                  name="minPrice"
                  value={searchForm.minPrice}
                  onChange={handleSearchChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">💰 Giá tối đa</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={searchForm.maxPrice}
                  onChange={handleSearchChange}
                  placeholder="Không giới hạn"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">🏷️ Khuyến mãi</label>
                <select
                  name="promotion"
                  value={searchForm.promotion}
                  onChange={handleSearchChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Có khuyến mãi</option>
                  <option value="false">Không khuyến mãi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">👁️ Lượt xem tối thiểu</label>
                <input
                  type="number"
                  name="minViews"
                  value={searchForm.minViews}
                  onChange={handleSearchChange}
                  placeholder="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex gap-4 justify-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={searching}
                >
                  {searching ? '⏳ Đang tìm...' : '🔍 Tìm Kiếm'}
                </button>
                <button
                  type="button"
                  className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleResetSearch}
                  disabled={searching}
                >
                  🔄 Đặt Lại
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loading States */}
        {(loading || searching) && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-600 font-medium">
                {loading ? '⏳ Đang tải sản phẩm...' : '🔍 Đang tìm kiếm...'}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && !searching && (
          <div className="max-w-md mx-auto mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-800 font-semibold">Có lỗi xảy ra</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product List */}
        {!loading && !error && (
          <div className="space-y-6">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có sản phẩm nào</h3>
                <p className="text-gray-500">Hãy thêm sản phẩm đầu tiên của bạn!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    📋 Danh sách sản phẩm ({products.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                            📦
                          </div>
                        )}
                        {/* Promotion Badge */}
                        {product.promotion && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🔥 Khuyến mãi
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">🏷️</span>
                            <span className="font-medium">{product.brand}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">📂</span>
                            <span>{product.category_name || 'Chưa có danh mục'}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">👁️</span>
                            <span>{product.views || 0} lượt xem</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(product.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
