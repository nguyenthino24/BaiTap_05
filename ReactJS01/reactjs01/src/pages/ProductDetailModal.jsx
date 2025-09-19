import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Spin, Statistic, Card, message, Input, List } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CommentOutlined } from '@ant-design/icons';
import axios from '../util/axios.customize.js';
import CheckoutPage from './CheckoutPage';

const { TextArea } = Input;

const ProductDetailModal = ({
  modalVisible,
  modalLoading,
  selectedProduct,
  similarProducts,
  counts,
  isFavorite,
  handleToggleFavorite,
  handleViewDetails,
  onClose,
  refreshCounts,
}) => {
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    if (modalVisible && selectedProduct) {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setUserHasPurchased(false);
        setComments([]);
        return;
      }
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        setUserHasPurchased(false);
        setComments([]);
        return;
      }

      // Check purchase
      axios.get(`/v1/api/products/check-purchase?userId=${user.id}&productId=${selectedProduct.id}`)
        .then(res => setUserHasPurchased(res.data.hasPurchased))
        .catch(() => setUserHasPurchased(false));

      // Load comments
      axios.get(`/v1/api/products/comments/${selectedProduct.id}`)
        .then(res => setComments(res.data || []))
        .catch(() => setComments([]));
    } else {
      setUserHasPurchased(false);
      setComments([]);
      setCommentText('');
    }
  }, [modalVisible, selectedProduct]);

  const handleFavoriteClick = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      message.error('Thông tin user không hợp lệ, vui lòng đăng nhập lại');
      return;
    }
    try {
      await handleToggleFavorite(user.id, selectedProduct.id);
    } catch {
      message.error('Lỗi khi cập nhật yêu thích');
    }
  };

  const handleBuyClick = () => setCheckoutVisible(true);
  const handleCheckoutComplete = () => {
    setCheckoutVisible(false);
    setUserHasPurchased(true);
  };
  const handleCheckoutCancel = () => setCheckoutVisible(false);

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      message.warning('Vui lòng nhập nội dung bình luận');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      message.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      message.error('Thông tin user không hợp lệ, vui lòng đăng nhập lại');
      return;
    }
    setCommentSubmitting(true);
    try {
      await axios.post('/v1/api/products/comment', {
        userId: user.id,
        productId: selectedProduct.id,
        commentText: commentText.trim(),
      });
      message.success('Đã thêm bình luận');
      setCommentText('');
      const res = await axios.get(`/v1/api/products/comments/${selectedProduct.id}`);
      setComments(res.data || []);
      // Refresh counts after comment to update commenterCount
      if (selectedProduct && selectedProduct.id) {
        refreshCounts(selectedProduct.id);
      }
    } catch {
      message.error('Lỗi khi thêm bình luận');
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        title={selectedProduct?.name}
        open={modalVisible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        {modalLoading ? (
          <Spin size="large" />
        ) : selectedProduct && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                {selectedProduct.image_url && (
                  <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
                )}
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavoriteClick}
                    style={{ marginRight: 8 }}
                  >
                    {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                  </Button>
                  <Button icon={<ShoppingCartOutlined />} onClick={handleBuyClick}>Mua ngay</Button>
                </div>
              </Col>
              <Col span={12}>
                <h3>{selectedProduct.name}</h3>
                <p><strong>Thương hiệu:</strong> {selectedProduct.brand}</p>
                <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN').format(selectedProduct.price)} VND</p>
                {selectedProduct.original_price && selectedProduct.discount_percentage > 0 && (
                  <p><strong>Giá gốc:</strong> <span style={{ textDecoration: 'line-through' }}>{new Intl.NumberFormat('vi-VN').format(selectedProduct.original_price)} VND</span> (-{selectedProduct.discount_percentage}%)</p>
                )}
                <p><strong>Danh mục:</strong> {selectedProduct.category_name}</p>
                <div style={{ marginTop: 16 }}>
                  <Statistic title="Số khách đã mua" value={counts.buyerCount} prefix={<ShoppingCartOutlined />} />
                  <Statistic title="Số khách đã bình luận" value={counts.commenterCount} prefix={<CommentOutlined />} style={{ marginTop: 8 }} />
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <h4>Sản phẩm tương tự</h4>
              <Row gutter={16}>
                {similarProducts.map((p) => (
                  <Col span={8} key={p.id}>
                    <Card
                      hoverable
                      cover={p.image_url ? <img src={p.image_url} alt={p.name} style={{ height: 150, objectFit: 'cover' }} /> : null}
                      onClick={() => handleViewDetails(p)}
                    >
                      <Card.Meta
                        title={p.name}
                        description={`${new Intl.NumberFormat('vi-VN').format(p.price)} VND`}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {userHasPurchased ? (
              <div style={{ marginTop: 24 }}>
                <h4>Bình luận</h4>
                <List
                  dataSource={comments}
                  locale={{ emptyText: 'Chưa có bình luận nào' }}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.user_name}
                        description={item.comment_text}
                      />
                      <div>{new Date(item.comment_date).toLocaleString()}</div>
                    </List.Item>
                  )}
                />
                <TextArea
                  rows={4}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  style={{ marginTop: 12 }}
                />
                <Button
                  type="primary"
                  onClick={handleCommentSubmit}
                  loading={commentSubmitting}
                  style={{ marginTop: 8 }}
                >
                  Gửi bình luận
                </Button>
              </div>
            ) : (
              <div style={{ marginTop: 24, fontStyle: 'italic', color: '#888' }}>
                Bạn phải mua sản phẩm mới có thể bình luận.
              </div>
            )}
          </div>
        )}
      </Modal>

      <CheckoutPage
        selectedProduct={selectedProduct}
        user={JSON.parse(localStorage.getItem('user') || '{}')}
        onPurchaseComplete={() => {
          handleCheckoutComplete();
          // Refresh counts after purchase to update buyerCount
          if (selectedProduct && selectedProduct.id) {
            refreshCounts(selectedProduct.id);
          }
        }}
        onCancel={handleCheckoutCancel}
        visible={checkoutVisible}
      />
    </>
  );
};

export default ProductDetailModal;
