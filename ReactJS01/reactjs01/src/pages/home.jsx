import React, { useState, useEffect } from 'react';
import { CrownOutlined, SearchOutlined } from '@ant-design/icons';
import { Result, Button, Spin, Card, Row, Col, Input, Select, Form, Space, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios.customize.js';
import { searchProductsApi } from '../util/api.js';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [form] = Form.useForm(); // ✅ dùng instance form để reset

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse] = await Promise.all([
        axios.get('/v1/api/products/with-category'),
        axios.get('/v1/api/categories')
      ]);
      setProducts(Array.isArray(productResponse) ? productResponse : []);
      setCategories(Array.isArray(categoryResponse) ? categoryResponse : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (values) => {
    setSearching(true);
    try {
      const params = {
        query: values.query || '',
        category: values.category ? parseInt(values.category) : undefined,
        minPrice: values.minPrice ? parseFloat(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseFloat(values.maxPrice) : undefined,
        promotion: values.promotion ? "true" : undefined,
        minViews: values.minViews ? parseInt(values.minViews) : undefined
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );

      const response = await searchProductsApi(filteredParams);
      const productsArray = Array.isArray(response) ? response : [];
      setProducts(productsArray);
    } catch (error) {
      console.error('❌ Search error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="50M Web Token (React/NodeJS) - iotstar.vn"
        extra={<Button type="primary" onClick={() => navigate('/products')}>Quản lý sản phẩm</Button>}
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
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={searching}>
                Tìm kiếm
              </Button>
              <Button
                htmlType="button"
                onClick={() => {
                  form.resetFields(); // ✅ reset form về mặc định
                  fetchData(); // ✅ gọi lại trang home ban đầu
                }}
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Sản phẩm</h2>
        {loading || searching ? (
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
                  cover={product.image_url ? <img alt={product.name} src={product.image_url} style={{ height: 200, objectFit: 'cover' }} /> : null}
                >
                  <Card.Meta
                    title={product.name}
                    description={
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                            {new Intl.NumberFormat('vi-VN').format(product.price)} VND
                          </span>
                          {product.original_price && product.discount_percentage > 0 && (
                            <>
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>
                                {new Intl.NumberFormat('vi-VN').format(product.original_price)} VND
                              </span>
                              <span style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                -{product.discount_percentage}%
                              </span>
                            </>
                          )}
                        </div>
                        <div style={{ color: '#666', marginTop: '4px' }}>
                          {product.category_name || 'Chưa có danh mục'}
                        </div>
                        {product.promotion && (
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
    </div>
  );
};

export default HomePage;
