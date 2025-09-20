import React, { useState, useEffect } from 'react';
import { SearchOutlined, CrownOutlined, HeartOutlined, HeartFilled, EyeOutlined, ShoppingCartOutlined, CommentOutlined } from '@ant-design/icons';
import { Result, Button, Spin, Card, Row, Col, Input, Select, Form, Space, Checkbox, message, Statistic } from 'antd';
import axios from '../util/axios.customize.js';
import { searchProductsApi } from '../util/api.js';
import ProductDetailModal from './ProductDetailModal';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [counts, setCounts] = useState({ buyerCount: 0, commenterCount: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set()); // Lưu danh sách sản phẩm yêu thích

  // Tự động tính phần trăm giảm giá
  const calculateDiscountPercentage = (originalPrice, currentPrice) => {
    if (originalPrice && currentPrice && originalPrice > currentPrice) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    return 0;
  };

  // Xử lý khi giá thay đổi
  const handlePriceChange = () => {
    const values = addForm.getFieldsValue();
    if (values.original_price && values.price && values.original_price > values.price) {
      const discountPercent = calculateDiscountPercentage(values.original_price, values.price);
      addForm.setFieldsValue({
        discount_percentage: discountPercent,
        promotion: true
      });
    } else if (!values.original_price) {
      addForm.setFieldsValue({
        discount_percentage: 0,
        promotion: false
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get('/v1/api/products/with-category'),
        axios.get('/v1/api/categories')
      ]);
      setProducts(Array.isArray(productResponse) ? productResponse : []);
      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
    } catch (err) {
      message.error('Lỗi khi tải dữ liệu: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return; // Không tải nếu chưa đăng nhập
    try {
      const response = await axios.get(`/v1/api/products/favorites/${user.id}`);
      const favoriteIds = new Set(response.map(fav => fav.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleAddProduct = async (values) => {
    try {
      const response = await axios.post('/v1/api/products', values);
      message.success(response.message || 'Thêm sản phẩm thành công!');
      addForm.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi thêm sản phẩm');
    }
  };

  const handleSearch = async (values) => {
    setSearching(true);
    try {
      const params = {
        query: values.query || '',
        category: values.category ? parseInt(values.category) : undefined,
        minPrice: values.minPrice ? parseFloat(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseFloat(values.maxPrice) : undefined,
        promotion: values.promotion ? 'true' : undefined,
        minViews: values.minViews ? parseInt(values.minViews) : undefined
      };
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );
      const response = await searchProductsApi(filteredParams);
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi tìm kiếm');
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetails = async (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
    setModalLoading(true);
    try {
      // Fetch similar products
      const similarResponse = await axios.get(`/v1/api/products/similar/${product.id}`);
      setSimilarProducts(Array.isArray(similarResponse) ? similarResponse : []);

      // Fetch counts
      const countsResponse = await axios.get(`/v1/api/products/counts/${product.id}`);
      setCounts(countsResponse);

      // Check if favorite
      const isFav = favorites.has(product.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error fetching product details:', error);
      message.error('Lỗi khi tải chi tiết sản phẩm');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleFavorite = async (userId, productId = selectedProduct?.id) => {
    if (!productId) return;

    try {
      if (isFavorite) {
        await axios.delete('/v1/api/products/favorites', { data: { userId, productId } });
        setIsFavorite(false);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        message.success('Đã xóa khỏi yêu thích');
      } else {
        await axios.post('/v1/api/products/favorites', { userId, productId });
        setIsFavorite(true);
        setFavorites(prev => new Set([...prev, productId]));
        message.success('Đã thêm vào yêu thích');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Lỗi khi cập nhật yêu thích');
    }
  };

  const handleCardFavorite = async (product, e) => {
    console.log('handleCardFavorite called for product:', product.id);
    e.stopPropagation(); // Ngăn không mở modal khi click vào nút yêu thích
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User from localStorage:', user);
    if (!user) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }
    const isFav = favorites.has(product.id);
    console.log('Is favorite:', isFav);
    try {
      if (isFav) {
        await axios.delete('/v1/api/products/favorites', { data: { userId: user.id, productId: product.id } });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
        message.success('Đã xóa khỏi yêu thích');
      } else {
        await axios.post('/v1/api/products/favorites', { userId: user.id, productId: product.id });
        setFavorites(prev => new Set([...prev, product.id]));
        message.success('Đã thêm vào yêu thích');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Lỗi khi cập nhật yêu thích');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="Trang Quản Lý Sản Phẩm"
      />

      {/* Form thêm sản phẩm */}
      <div style={{ marginTop: 20 }}>
        <h2>Thêm sản phẩm mới</h2>
        <Form
          layout="vertical"
          form={addForm}
          onFinish={handleAddProduct}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng nhập thương hiệu' }]}>
                <Input placeholder="Nhập thương hiệu" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="price" label="Giá hiện tại (VND)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                <Input type="number" placeholder="Nhập giá hiện tại" onChange={handlePriceChange} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="original_price" label="Giá gốc (VND)">
                <Input type="number" placeholder="Nhập giá gốc (nếu có khuyến mãi)" onChange={handlePriceChange} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="image_url" label="URL hình ảnh">
                <Input placeholder="Nhập URL hình ảnh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category_id" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select placeholder="Chọn danh mục">
                  {categories.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {/* Hidden fields for automatic values */}
            <Form.Item name="discount_percentage" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="promotion" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
          </Row>
          <Button type="primary" htmlType="submit">Thêm sản phẩm</Button>
        </Form>
      </div>

      {/* Form tìm kiếm */}
      <div style={{ marginTop: 40 }}>
        <h2>Tìm kiếm sản phẩm</h2>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSearch}
          initialValues={{
            query: '',
            category: null,
            minPrice: '',
            maxPrice: '',
            promotion: false,
            minViews: ''
          }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="query" label="Từ khóa">
                <Input placeholder="Nhập từ khóa" prefix={<SearchOutlined />} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="category" label="Danh mục">
                <Select placeholder="Chọn danh mục" allowClear>
                  {categories.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minPrice" label="Giá tối thiểu">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maxPrice" label="Giá tối đa">
                <Input type="number" placeholder="Không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="promotion" valuePropName="checked" label="Có khuyến mãi">
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minViews" label="Lượt xem tối thiểu">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button type="primary" htmlType="submit" loading={searching}>Tìm kiếm</Button>
            <Button
              onClick={() => {
                form.resetFields();
                fetchData();
              }}
            >
              Đặt lại
            </Button>
          </Space>
        </Form>
      </div>

      {/* Danh sách sản phẩm */}
      <div style={{ marginTop: 40 }}>
        <h2>{products.length} sản phẩm</h2>
        {loading || searching ? (
          <Spin size="large" />
        ) : (
          <Row gutter={16}>
            {products.map((p) => (
              <Col span={8} key={p.id}>
                <Card
                  hoverable
                  cover={p.image_url ? <img src={p.image_url} alt={p.name} style={{ height: 200, objectFit: 'cover' }} /> : null}
                  actions={[
                    <Button
                      type="link"
                      icon={favorites.has(p.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      onClick={(e) => handleCardFavorite(p, e)}
                      style={{ color: favorites.has(p.id) ? '#ff4d4f' : 'inherit' }}
                    >
                      {favorites.has(p.id) ? 'Đã thích' : 'Yêu thích'}
                    </Button>,
                    <Button type="link" onClick={() => handleViewDetails(p)}>Xem chi tiết</Button>
                  ]}
                >
                  <Card.Meta
                    title={p.name}
                    description={
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                            {new Intl.NumberFormat('vi-VN').format(p.price)} VND
                          </span>
                          {p.original_price && p.discount_percentage > 0 && (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                                {new Intl.NumberFormat('vi-VN').format(p.original_price)} VND
                              </span>
                              <span style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                -{p.discount_percentage}%
                              </span>
                            </>
                          )}
                        </div>
                        <div style={{ color: '#666', marginTop: '4px' }}>
                          {p.category_name || 'Chưa có danh mục'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: '#888', fontSize: '12px' }}>
                          <EyeOutlined />
                          <span>{p.views || 0} lượt xem</span>
                        </div>
                        {p.promotion && (
                          <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
                            🔥 Khuyến mãi hot
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <ProductDetailModal
        modalVisible={modalVisible}
        modalLoading={modalLoading}
        selectedProduct={selectedProduct}
        similarProducts={similarProducts}
        counts={counts}
        isFavorite={isFavorite}
        handleToggleFavorite={handleToggleFavorite}
        handleViewDetails={handleViewDetails}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default ProductPage;
