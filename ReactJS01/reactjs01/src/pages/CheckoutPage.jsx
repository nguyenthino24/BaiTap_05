import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';

const CheckoutPage = ({ selectedProduct, user, onPurchaseComplete, onCancel, visible }) => {
  const [confirming, setConfirming] = useState(false);

  // Kiểm tra nếu selectedProduct hoặc user là null để tránh lỗi
  if (!selectedProduct || !user || !user.id) {
    return (
      <Modal
        title="Lỗi"
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <p>Không thể tải thông tin sản phẩm hoặc người dùng. Vui lòng thử lại.</p>
      </Modal>
    );
  }

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      // Call API to create order
      const response = await fetch('/v1/api/products/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          productId: selectedProduct.id,
          quantity: 1,
        }),
      });
      if (response.ok) {
        message.success('Thanh toán thành công');
        onPurchaseComplete();
      } else {
        message.error('Thanh toán thất bại');
      }
    } catch (error) {
      message.error('Lỗi khi thanh toán');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      title="Xác nhận thanh toán"
      visible={visible}
      onOk={handleConfirmPayment}
      onCancel={onCancel}
      okText="Xác nhận thanh toán"
      cancelText="Hủy"
      confirmLoading={confirming}
    >
      <p>Bạn có chắc chắn muốn mua sản phẩm:</p>
      <p><strong>{selectedProduct.name}</strong></p>
      <p>Giá: {new Intl.NumberFormat('vi-VN').format(selectedProduct.price)} VND</p>
    </Modal>
  );
};

export default CheckoutPage;
