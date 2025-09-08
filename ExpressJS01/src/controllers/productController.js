// controllers/productController.js
const Product = require("../models/product");
const esClient = require("../config/elasticsearch");

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

exports.searchProducts = async (req, res) => {
  try {
    const { query, category, minPrice, maxPrice, promotion, minViews } = req.query;

    let esQuery = {
      bool: {
        should: [],
        minimum_should_match: 1
      }
    };

    if (query) {
      esQuery.bool.should.push({
        multi_match: {
          query: query,
          fields: ["name^3", "brand", "category_name"],
          fuzziness: "AUTO"
        }
      });
    }

    // Thay đổi từ filter sang should để sử dụng OR logic
    if (category) esQuery.bool.should.push({ term: { category_id: parseInt(category) } });
    if (minPrice || maxPrice) {
      let range = {};
      if (minPrice) range.gte = parseFloat(minPrice);
      if (maxPrice) range.lte = parseFloat(maxPrice);
      esQuery.bool.should.push({ range: { price: range } });
    }
    if (promotion !== undefined) esQuery.bool.should.push({ term: { promotion: promotion === "true" } });
    if (minViews) esQuery.bool.should.push({ range: { views: { gte: parseInt(minViews) } } });

    const { body } = await esClient.search({
      index: "products",
      body: { query: esQuery }
    });

    const hits = body.hits.hits.map(hit => hit._source);
    res.json(hits);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
