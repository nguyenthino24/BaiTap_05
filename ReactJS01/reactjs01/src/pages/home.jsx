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
  const [searchForm, setSearchForm] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    promotion: false,
    minViews: ''
  });

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="50M Web Token (React/NodeJS) - iotstar.vn"
        extra={<Button type="primary" onClick={() => navigate('/products')}>Xem sản phẩm</Button>}
      />
      <div style={{ marginTop: 20 }}>
        <h2>Tìm kiếm sản phẩm</h2>
        <Form
          layout="vertical"
          onFinish={async (values) => {
            setSearching(true);
            try {
              const params = {
                query: values.query,
                category: values.category,
                minPrice: values.minPrice,
                maxPrice: values.maxPrice,
                promotion: values.promotion,
                minViews: values.minViews
              };
              const response = await searchProductsApi(params);
              setProducts(Array.isArray(response) ? response : []);
            } catch (error) {
              console.error('Search error:', error);
            } finally {
              setSearching(false);
            }
          }}
          initialValues={searchForm}
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
                  setSearchForm({
                    query: '',
                    category: '',
                    minPrice: '',
                    maxPrice: '',
                    promotion: false,
                    minViews: ''
                  });
                  setLoading(true);
                  axios.get('/v1/api/products/with-category').then((res) => {
                    setProducts(Array.isArray(res) ? res : []);
                    setLoading(false);
                  });
                }}
              >
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Sản phẩm nổi bật</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={16}>
            {products.slice(0, 6).map((product) => (
              <Col span={8} key={product.id}>
                <Card
                  hoverable
                  cover={product.image_url ? <img alt={product.name} src={product.image_url} /> : null}
                >
                  <Card.Meta
                    title={product.name}
                    description={`${product.price} VND - ${product.category_name || 'Chưa có danh mục'}`}
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