const Product = require("../models/product");
const esClient = require("../config/elasticsearch");
const { pool } = require("../models/user");
const Favorite = require("../models/favorite");

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

// Đếm số khách mua và khách bình luận trên sản phẩm
exports.getBuyerCommenterCounts = async (req, res) => {
  try {
    const productId = req.params.productId;
    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }
    // Giả định có bảng orders và comments, đếm số user mua và bình luận
    const [buyerRows] = await pool.query(
      "SELECT COUNT(DISTINCT user_id) AS buyerCount FROM orders WHERE product_id = ?",
      [productId]
    );
    const [commenterRows] = await pool.query(
      "SELECT COUNT(DISTINCT user_id) AS commenterCount FROM comments WHERE product_id = ?",
      [productId]
    );
    res.json({
      buyerCount: buyerRows[0]?.buyerCount || 0,
      commenterCount: commenterRows[0]?.commenterCount || 0
    });
  } catch (error) {
    console.error("❌ Lỗi khi đếm khách mua và bình luận:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Initialize favorites table on server start - moved to model
