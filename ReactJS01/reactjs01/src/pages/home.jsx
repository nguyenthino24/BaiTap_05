import React, { useState, useEffect } from 'react';
import { CrownOutlined } from '@ant-design/icons';
import { Result, Button, Spin, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../util/axios.customize.js';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Do axios call - interceptor đã return response.data
        const response = await axios.get('/v1/api/products/with-category');

        // response đã là data (không cần response.data nữa)
        setProducts(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="50M Web Token (React/NodeJS) - iotstar.vn"
        extra={
          <Button type="primary" onClick={() => navigate('/products')}>
            Xem sản phẩm
          </Button>
        }
      />
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
                  cover={
                    product.image_url ? (
                      <img alt={product.name} src={product.image_url} />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={product.name}
                    description={`${product.price} VND - ${
                      product.category_name || 'Chưa có danh mục'
                    }`}
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
