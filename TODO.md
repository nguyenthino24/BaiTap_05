# TODO: Thêm chức năng mua hàng và bình luận

## Đã hoàn thành:
- [x] Tạo model order.js cho đơn hàng
- [x] Tạo model comment.js cho bình luận
- [x] Thêm hàm createOrder, createComment, getCommentsByProduct, checkPurchase vào productController.js
- [x] Cập nhật routes/product.js với các endpoint mới
- [x] Cập nhật ProductDetailModal.jsx với nút mua hàng và form bình luận (chỉ hiện khi đã mua)
- [x] Sửa hàm getBuyerCommenterCounts để lấy dữ liệu thực từ bảng orders và comments

## Các bước tiếp theo:
- [ ] Kiểm thử quy trình mua hàng: đăng nhập, chọn sản phẩm, nhấn mua, tạo đơn hàng thành công
- [ ] Kiểm thử bình luận: chỉ người mua mới có thể bình luận, hiển thị danh sách bình luận
- [ ] Kiểm tra cập nhật số liệu đếm khách mua và bình luận chính xác
- [ ] Xử lý xác thực người dùng cho các API mua hàng và bình luận
- [ ] Kiểm tra lỗi và xử lý ngoại lệ trong frontend và backend
