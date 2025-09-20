const Product = require("../models/product");
const esClient = require("../config/elasticsearch");
const { pool } = require("../models/user");
const Favorite = require("../models/favorite");
const Order = require("../models/order");
const Comment = require("../models/comment");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      original_price,
      discount_percentage,
      image_url,
      category_id,
      promotion,
    } = req.body;

    if (!name || !brand || !price || !category_id) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const newProduct = await Product.createProduct(
      name,
      brand,
      price,
      original_price,
      discount_percentage,
      image_url,
      category_id,
      promotion
    );

    res.status(201).json({ message: "Tạo sản phẩm thành công", product: newProduct });
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getProductsWithCategories = async (req, res) => {
  try {
    const products = await Product.getProductsWithCategories();
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm với danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, promotion, minViews } = req.query;
    const products = await Product.searchProductsMySQL({
      query,
      category,
      minPrice,
      maxPrice,
      promotion,
      minViews
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getProductsPaginated = async (req, res) => {
  try {
    const { categoryId, page, limit } = req.query;
    const result = await Product.getProductsPaginated({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 6
    });
    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm phân trang:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm sản phẩm yêu thích
exports.addFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    console.log('API addFavorite called:', { userId, productId });
    if (!userId || !productId) {
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    }
    const added = await Favorite.addFavorite(userId, productId);
    console.log('addFavorite result:', added);
    if (!added) {
      return res.status(409).json({ message: "Sản phẩm đã được yêu thích" });
    }
    res.status(201).json({ message: "Đã thêm sản phẩm yêu thích" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa sản phẩm yêu thích
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    }
    const removed = await Favorite.removeFavorite(userId, productId);
    if (!removed) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm yêu thích" });
    }
    res.json({ message: "Đã xóa sản phẩm yêu thích" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách sản phẩm yêu thích của user
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }
    const favorites = await Favorite.getFavoritesByUser(userId);
    res.json(favorites);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm yêu thích:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy sản phẩm tương tự theo category hoặc brand
exports.getSimilarProducts = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }
    // Lấy sản phẩm gốc
    const [productRows] = await pool.query("SELECT * FROM products WHERE id = ?", [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    const product = productRows[0];
    // Tìm sản phẩm tương tự theo category hoặc brand, không lấy sản phẩm hiện tại
    const [similarProducts] = await pool.query(
      "SELECT * FROM products WHERE (category_id = ? OR brand = ?) AND id != ? LIMIT 10",
      [product.category_id, product.brand, productId]
    );
    res.json(similarProducts);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm tương tự:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy sản phẩm đã xem (giả định lưu trong session hoặc bảng riêng, ở đây lấy top 10 sản phẩm có lượt xem cao)
exports.getViewedProducts = async (req, res) => {
  try {
    const [viewedProducts] = await pool.query("SELECT * FROM products ORDER BY views DESC LIMIT 10");
    res.json(viewedProducts);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm đã xem:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getBuyerCommenterCounts = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }
    // Đếm tổng lượt mua và tổng số bình luận trên sản phẩm từ bảng orders và comments
    const [buyerRows] = await pool.query(
      "SELECT COUNT(*) AS buyerCount FROM orders WHERE product_id = ?",
      [productId]
    );
    const [commenterRows] = await pool.query(
      "SELECT COUNT(*) AS commenterCount FROM comments WHERE product_id = ?",
      [productId]
    );
    res.json({
      buyerCount: buyerRows[0]?.buyerCount || 0,
      commenterCount: commenterRows[0]?.commenterCount || 0
    });
  } catch (error) {
    console.error("❌ Lỗi khi đếm lượt mua và bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    }
    const orderId = await Order.createOrder(userId, productId, quantity || 1);
    res.status(201).json({ message: "Đã tạo đơn hàng", orderId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo đơn hàng:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { userId, productId, commentText } = req.body;
    if (!userId || !productId || !commentText) {
      return res.status(400).json({ message: "Thiếu thông tin bình luận" });
    }
    // Kiểm tra user đã mua sản phẩm chưa
    const hasPurchased = await Order.hasUserPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      return res.status(403).json({ message: "Chỉ người mua sản phẩm mới được bình luận" });
    }
    const commentId = await Comment.createComment(userId, productId, commentText);
    res.status(201).json({ message: "Đã thêm bình luận", commentId });
  } catch (error) {
    console.error("❌ Lỗi khi tạo bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getCommentsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    console.log(`📡 API: Lấy bình luận cho sản phẩm ${productId}`);
    const comments = await Comment.getCommentsByProduct(productId);

    console.log(`✅ API: Trả về ${comments.length} bình luận cho sản phẩm ${productId}`);
    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy bình luận:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy bình luận",
      error: error.message
    });
  }
};

exports.getCommentStats = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    console.log(`📊 API: Lấy thống kê bình luận cho sản phẩm ${productId}`);
    const stats = await Comment.getCommentStats(productId);

    console.log(`✅ API: Thống kê bình luận cho sản phẩm ${productId}:`, stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy thống kê bình luận:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê bình luận",
      error: error.message
    });
  }
};

exports.checkPurchase = async (req, res) => {
  try {
    const { userId, productId } = req.query;
    if (!userId || !productId) {
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    }
    const hasPurchased = await Order.hasUserPurchasedProduct(userId, productId);
    res.json({ hasPurchased });
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra mua hàng:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }
    const product = await Product.getProductById(productId);
    res.json(product);
  } catch (error) {
    console.error("❌ Lỗi khi lấy sản phẩm theo ID:", error.message);
    if (error.message === 'Product not found') {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    } else {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }
    const updatedProduct = await Product.incrementProductViews(productId);
    res.json({
      message: "Đã tăng lượt xem sản phẩm",
      product: updatedProduct
    });
  } catch (error) {
    console.error("❌ Lỗi khi tăng lượt xem sản phẩm:", error.message);
    if (error.message === 'Product not found') {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    } else {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};
