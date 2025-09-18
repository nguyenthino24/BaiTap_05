import React from 'react';
import { Modal, Row, Col, Button, Spin, Statistic, Card, message } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CommentOutlined } from '@ant-design/icons';

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
}) => {
  const handleFavoriteClick = async () => {
    console.log('Favorite button clicked in modal');
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      message.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích');
      return;
    }
    const user = JSON.parse(userStr);
    console.log('User from localStorage:', user);
    if (!user || !user.id) {
      message.error('Thông tin user không hợp lệ, vui lòng đăng nhập lại');
      return;
    }
    try {
      // Pass both userId and productId to handleToggleFavorite
      const result = await handleToggleFavorite(user.id, selectedProduct.id);
      console.log('handleToggleFavorite result:', result);
    } catch (error) {
      message.error('Lỗi khi cập nhật yêu thích');
      console.error('Error in handleToggleFavorite:', error);
    }
  };

  return (
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
                <Button icon={<ShoppingCartOutlined />}>Thêm vào giỏ</Button>
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
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailModal;
