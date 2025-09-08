// controllers/productController.js
const Product = require("../models/product");

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
    const { name, brand, price, image_url, category_id } = req.body;
    if (!name || !brand || !price) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }
    const product = await Product.createProduct(name, brand, price, image_url, category_id);
    res.status(201).json({ message: "✅ Sản phẩm đã được thêm", product });
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getProductsWithCategories = async (req, res) => {
  try {
    const products = await Product.getProductsWithCategories();
    res.json(products);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
