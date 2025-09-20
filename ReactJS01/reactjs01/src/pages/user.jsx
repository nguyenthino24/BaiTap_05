import { notification, Table, Tabs, Card, Row, Col, Spin, message, Button, Statistic } from "antd";
import { useEffect, useState } from "react";
import { getUserApi, getCurrentUserApi } from "../util/api";
import { getRecentlyViewed, addToRecentlyViewed } from '../util/recentlyViewed';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import axios from '../util/axios.customize.js';
import ProductDetailModal from './ProductDetailModal';

const UserPage = () => {
  const [dataSource, setDataSource] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Favorites
  const [favorites, setFavorites] = useState([]);
  const [favoritesSet, setFavoritesSet] = useState(new Set());
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [viewedLoading, setViewedLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [counts, setCounts] = useState({ buyerCount: 0, commenterCount: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();
        if (res?.message) {
          notification.error({
            message: "Không được phép",
            description: res.message
          });
        } else {
          setDataSource(res || []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        notification.error({
          message: "Lỗi",
          description: "Không thể lấy danh sách người dùng."
        });
      }
    };

    const fetchCurrentUserData = async () => {
      try {
        const userRes = await getCurrentUserApi();
        if (userRes && userRes.id) {
          setCurrentUser(userRes);
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              if (user && user.id) {
                setCurrentUser(user);
              }
            } catch (e) {
              console.error('Lỗi khi phân tích user từ localStorage:', e);
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && user.id) {
              setCurrentUser(user);
            }
          } catch (e) {
            console.error('Lỗi khi phân tích user từ localStorage:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCurrentUserData();

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          loadFavorites(user.id);
        }
      } catch (e) {
        console.error('Lỗi khi phân tích user từ localStorage:', e);
      }
    }
    loadViewedProducts();
  }, []);

  const loadFavorites = async (userId) => {
    if (!userId) return;
    try {
      setFavoritesLoading(true);
      const response = await axios.get(`/v1/api/products/favorites/${userId}`);
      const favoritesData = Array.isArray(response) ? response : [];
      setFavorites(favoritesData);
      setFavoritesSet(new Set(favoritesData.map(fav => fav.id)));
    } catch (error) {
      console.error('Lỗi khi tải danh sách yêu thích:', error);
      message.error('Không thể tải danh sách yêu thích.');
    } finally {
      setFavoritesLoading(false);
    }
  };

  const loadViewedProducts = () => {
    try {
      setViewedLoading(true);
      const viewed = getRecentlyViewed();
      setRecentlyViewed(Array.isArray(viewed) ? viewed : []);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm đã xem:', error);
      message.error('Không thể tải sản phẩm đã xem.');
    } finally {
      setViewedLoading(false);
    }
  };

  const handleToggleFavorite = async (userId, productId) => {
    if (!userId) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích.');
      return;
    }

    try {
      const isFav = favoritesSet.has(productId);
      if (isFav) {
        await axios.delete('/v1/api/products/favorites', { data: { userId, productId } });
        setFavorites(prev => prev.filter(fav => fav.id !== productId));
        setFavoritesSet(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        message.success('Đã xóa khỏi yêu thích.');
      } else {
        const product = favorites.find(fav => fav.id === productId) || { id: productId };
        await axios.post('/v1/api/products/favorites', { userId, productId });
        setFavorites(prev => [...prev, product]);
        setFavoritesSet(prev => new Set([...prev, productId]));
        message.success('Đã thêm vào yêu thích.');
      }
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error);
      message.error('Không thể cập nhật yêu thích.');
      return false;
    }
  };

  const handleViewDetails = async (product) => {
    if (!product) return;
    console.log('Opening modal for product:', product); // Debug
    setModalVisible(true);
    setSelectedProduct(product);
    setIsFavorite(favoritesSet.has(product.id));
    setModalLoading(true);

    try {
      addToRecentlyViewed(product);
    } catch (error) {
      console.error('Lỗi khi thêm vào danh sách đã xem:', error);
    }

    try {
      const [similarResponse, countsResponse] = await Promise.all([
        axios.get(`/v1/api/products/similar/${product.id}`),
        axios.get(`/v1/api/products/counts/${product.id}`),
      ]);
      setSimilarProducts(Array.isArray(similarResponse) ? similarResponse : []);
      setCounts(countsResponse || { buyerCount: 0, commenterCount: 0 });
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      message.error('Không thể tải chi tiết sản phẩm.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setSimilarProducts([]);
    setCounts({ buyerCount: 0, commenterCount: 0 });
    setIsFavorite(false);
  };

  const refreshCounts = async (productId) => {
    try {
      const countsResponse = await axios.get(`/v1/api/products/counts/${productId}`);
      setCounts(countsResponse || { buyerCount: 0, commenterCount: 0 });
    } catch (error) {
      console.error('Lỗi khi refresh counts:', error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Vai trò', dataIndex: 'role' },
  ];

  const items = [
    {
      key: '1',
      label: 'Danh sách người dùng',
      children: (
        <Table bordered dataSource={dataSource} columns={columns} rowKey="id" />
      ),
    },
    {
      key: '2',
      label: 'Thông tin cá nhân',
      children: loading ? (
        <Spin size="large" />
      ) : currentUser ? (
        <Card title="Thông tin cá nhân">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="Tên" value={currentUser.name} />
            </Col>
            <Col span={12}>
              <Statistic title="Email" value={currentUser.email} />
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={12}>
              <Statistic title="Vai trò" value={currentUser.role} />
            </Col>
            <Col span={12}>
              <Statistic title="ID" value={currentUser.id} />
            </Col>
          </Row>
        </Card>
      ) : (
        <p>Không thể tải thông tin người dùng.</p>
      ),
    },
    {
      key: '3',
      label: 'Sản phẩm yêu thích',
      children: favoritesLoading ? (
        <Spin size="large" />
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Chưa có sản phẩm yêu thích.</p>
        </div>
      ) : (
        <Row gutter={16}>
          {favorites.map((product) => (
            <Col span={6} key={product.id}>
              <Card
                hoverable
                cover={product.image_url ? (
                  <img alt={product.name} src={product.image_url} style={{ height: 150, objectFit: 'cover' }} loading="lazy" />
                ) : null}
                actions={[
                  <Button
                    type="link"
                    icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                    onClick={() => handleToggleFavorite(currentUser?.id, product.id)}
                  >
                    Đã thích
                  </Button>,
                  <Button type="link" onClick={() => handleViewDetails(product)}>
                    Xem chi tiết
                  </Button>
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {new Intl.NumberFormat('vi-VN').format(product.price)} VND
                    </span>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: '4',
      label: 'Sản phẩm đã xem gần đây',
      children: viewedLoading ? (
        <Spin size="large" />
      ) : recentlyViewed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Chưa có sản phẩm đã xem.</p>
        </div>
      ) : (
        <Row gutter={16}>
          {recentlyViewed.map((product) => (
            <Col span={6} key={product.id}>
              <Card
                hoverable
                cover={product.image_url ? (
                  <img alt={product.name} src={product.image_url} style={{ height: 150, objectFit: 'cover' }} loading="lazy" />
                ) : null}
                actions={[
                  favoritesSet.has(product.id) ? (
                    <HeartFilled
                      key="favorite"
                      style={{ color: 'red' }}
                      onClick={() => handleToggleFavorite(currentUser?.id, product.id)}
                    />
                  ) : (
                    <HeartOutlined
                      key="favorite"
                      onClick={() => handleToggleFavorite(currentUser?.id, product.id)}
                    />
                  ),
                  <Button type="link" onClick={() => handleViewDetails(product)}>
                    Xem chi tiết
                  </Button>
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {new Intl.NumberFormat('vi-VN').format(product.price)} VND
                    </span>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      <Tabs defaultActiveKey="1" items={items} />
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
        refreshCounts={refreshCounts}
      />
    </div>
  );
};

export default UserPage;