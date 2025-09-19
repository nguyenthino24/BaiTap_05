import React, { useState, useEffect, useRef } from 'react';
import { CrownOutlined, SearchOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import {
  Result,
  Button,
  Spin,
  Card,
  Row,
  Col,
  Input,
  Select,
  Form,
  Space,
  Checkbox,
  message,
  Modal,
  Statistic,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios.customize.js';
import { searchProductsApi } from '../util/api.js';
import ProductDetailModal from './ProductDetailModal';
import { getRecentlyViewed, addToRecentlyViewed } from '../util/recentlyViewed.js';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [form] = Form.useForm();

  // Lazy load state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Viewed products
  const [viewedProducts, setViewedProducts] = useState([]);
  const [viewedLoading, setViewedLoading] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState(new Set());

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [counts, setCounts] = useState({ buyerCount: 0, commenterCount: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchData = async (reset = false) => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get(`/v1/api/products/paginated?page=${reset ? 1 : page}&limit=6`),
        axios.get('/v1/api/categories'),
      ]);

      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);

      if (reset) {
        setProducts(productResponse.products || []);
        setHasMore(productResponse.hasMore);
        setPage(1);
      } else {
        setProducts((prev) => [...prev, ...(productResponse.products || [])]);
        setHasMore(productResponse.hasMore);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đảm bảo user được lấy lại khi load lại trang và load favorites
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          loadFavorites(user.id);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    fetchData(true);
    loadViewedProducts();
  }, []);

  const loadViewedProducts = () => {
    try {
      setViewedLoading(true);
      const viewed = getRecentlyViewed();
      setViewedProducts(viewed);
    } catch (error) {
      console.error('Error loading viewed products:', error);
    } finally {
      setViewedLoading(false);
    }
  };

  const loadFavorites = async (userId) => {
    if (!userId) return; // Không tải nếu chưa đăng nhập
    try {
      const response = await axios.get(`/v1/api/products/favorites/${userId}`);
      const favoriteIds = new Set(response.map(fav => fav.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleCardFavorite = async (product, e) => {
    e.stopPropagation(); // Ngăn không mở modal khi click vào nút yêu thích
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }
    const isFav = favorites.has(product.id);
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

  // Intersection Observer cho lazy load
  useEffect(() => {
    if (!loaderRef.current || !hasMore || searching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, searching]);

  // Fetch thêm khi đổi trang
  useEffect(() => {
    if (page > 1 && !searching) {
      fetchData();
    }
  }, [page]);

  const handleSearch = async (values) => {
    setSearching(true);
    try {
      const params = {
        query: values.query || '',
        category: values.category ? parseInt(values.category) : undefined,
        minPrice: values.minPrice ? parseFloat(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseFloat(values.maxPrice) : undefined,
        promotion: values.promotion ? 'true' : undefined,
        minViews: values.minViews ? parseInt(values.minViews) : undefined,
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );

      const response = await searchProductsApi(filteredParams);
      const productsArray = Array.isArray(response) ? response : [];
      setProducts(productsArray);
      setHasMore(false); // khi search thì dừng lazy load
    } catch (error) {
      console.error('❌ Search error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetails = async (product) => {
    setModalLoading(true);
    setModalVisible(true);
    setSelectedProduct(product);
    setIsFavorite(favorites.has(product.id));

    try {
      addToRecentlyViewed(product);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }

    try {
      const [similarResponse, countsResponse] = await Promise.all([
        axios.get(`/v1/api/products/similar/${product.id}`),
        axios.get(`/v1/api/products/${product.id}/counts`),
      ]);

      setSimilarProducts(Array.isArray(similarResponse) ? similarResponse : []);
      setCounts(countsResponse || { buyerCount: 0, commenterCount: 0 });
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleFavorite = async (userId, productId = selectedProduct?.id) => {
    if (!productId) return;

    const isFav = isFavorite;
    try {
      if (isFav) {
        await axios.delete('/v1/api/products/favorites', { data: { userId, productId } });
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setIsFavorite(false);
        message.success('Đã xóa khỏi yêu thích');
      } else {
        await axios.post('/v1/api/products/favorites', { userId, productId });
        setFavorites(prev => new Set([...prev, productId]));
        setIsFavorite(true);
        message.success('Đã thêm vào yêu thích');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      message.error('Lỗi khi cập nhật yêu thích');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setSimilarProducts([]);
    setCounts({ buyerCount: 0, commenterCount: 0 });
    setIsFavorite(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="50M Web Token (React/NodeJS) - iotstar.vn"
        extra={
          <Button type="primary" onClick={() => navigate('/products')}>
            Quản lý sản phẩm
          </Button>
        }
      />

      <div style={{ marginTop: 20 }}>
        <h2>Tìm kiếm sản phẩm</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            query: '',
            category: null,
            minPrice: '',
            maxPrice: '',
            promotion: false,
            minViews: '',
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
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
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
              <Form.Item
                name="promotion"
                valuePropName="checked"
                label="Có khuyến mãi"
              >
                <Checkbox />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="minViews" label="Lượt xem tối thiểu">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={searching}>
                Tìm kiếm
              </Button>
              <Button
                htmlType="button"
                onClick={() => {
                  form.resetFields();
                  fetchData(true);
                }}
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {/* Sản phẩm đã xem */}
      <div style={{ marginTop: 20 }}>
        <h2>Sản phẩm đã xem gần đây</h2>
        {viewedLoading ? (
          <Spin size="large" />
        ) : viewedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Chưa có sản phẩm đã xem.</p>
          </div>
        ) : (
          <Row gutter={16}>
            {viewedProducts.map((product) => (
              <Col span={6} key={product.id}>
                <Card
                  hoverable
                  cover={
                    product.image_url ? (
                      <img
                        alt={product.name}
                        src={product.image_url}
                        style={{ height: 150, objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : null
                  }
                  actions={[
                    favorites.has(product.id) ? (
                      <HeartFilled
                        key="favorite"
                        style={{ color: 'red' }}
                        onClick={(e) => handleCardFavorite(product, e)}
                      />
                    ) : (
                      <HeartOutlined
                        key="favorite"
                        onClick={(e) => handleCardFavorite(product, e)}
                      />
                    ),
                    <Button type="link" onClick={() => handleViewDetails(product)}>Xem chi tiết</Button>
                  ]}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <div>
                        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                          {new Intl.NumberFormat('vi-VN').format(product.price)} VND
                        </span>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Sản phẩm</h2>
        {loading && products.length === 0 ? (
          <Spin size="large" />
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        ) : (
          <Row gutter={16}>
          {products.map((product) => (
            <Col span={8} key={product.id}>
              <Card
                hoverable
                cover={
                  product.image_url ? (
                    <img
                      alt={product.name}
                      src={product.image_url}
                      style={{ height: 200, objectFit: 'cover' }}
                      loading="lazy" // ✅ lazy load ảnh
                    />
                  ) : null
                }
                actions={[
                  <Button
                    type="link"
                    icon={favorites.has(product.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={(e) => handleCardFavorite(product, e)}
                    style={{ color: favorites.has(product.id) ? '#ff4d4f' : 'inherit' }}
                  >
                    {favorites.has(product.id) ? 'Đã thích' : 'Yêu thích'}
                  </Button>,
                  <Button type="link" onClick={() => handleViewDetails(product)}>Xem chi tiết</Button>
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 'bold',
                            color: '#1890ff',
                            fontSize: '16px',
                          }}
                        >
                          {new Intl.NumberFormat('vi-VN').format(
                            product.price
                          )}{' '}
                          VND
                        </span>
                        {product.original_price &&
                          product.discount_percentage > 0 && (
                            <>
                              <span
                                style={{
                                  textDecoration: 'line-through',
                                  color: '#999',
                                  fontSize: '14px',
                                }}
                              >
                                {new Intl.NumberFormat('vi-VN').format(
                                  product.original_price
                                )}{' '}
                                VND
                              </span>
                              <span
                                style={{
                                  backgroundColor: '#ff4d4f',
                                  color: 'white',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                }}
                              >
                                -{product.discount_percentage}%
                              </span>
                            </>
                          )}
                      </div>
                      <div style={{ color: '#666', marginTop: '4px' }}>
                        {product.category_name || 'Chưa có danh mục'}
                      </div>
                      {product.promotion && (
                        <div
                          style={{
                            color: '#ff4d4f',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            marginTop: '4px',
                          }}
                        >
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
        {loading && products.length > 0 && (
          <Spin style={{ display: 'block', margin: '20px auto' }} />
        )}
        <div ref={loaderRef} style={{ height: 50 }} />
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

export default HomePage;
