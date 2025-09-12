const Product = require("../models/product");
const esClient = require("../config/elasticsearch");
const { pool } = require("../models/user");

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
    const { name, brand, price, original_price, discount_percentage, image_url, category_id, promotion } = req.body;
    if (!name || !brand || !price) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }
    const product = await Product.createProduct(name, brand, price, original_price, discount_percentage, image_url, category_id, promotion);
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
    const { query, category, minPrice, maxPrice, promotion, minViews, source } = req.query;
    console.log('Request query params:', req.query);

    if (source === 'mysql') {
      // Use MySQL search
      const results = await Product.searchProductsMySQL({ query, category, minPrice, maxPrice, promotion, minViews });
      return res.json(results);
    }

    // Default to Elasticsearch search
    let esQuery = {
      bool: {
        must: query ? [{
          multi_match: {
            query: query.toLowerCase(),
            fields: ["name^3", "brand", "category_name"],
            fuzziness: "AUTO"
          }
        }] : [{ match_all: {} }],
        filter: []
      }
    };

    if (category) esQuery.bool.filter.push({ term: { category_id: parseInt(category) } });
    if (minPrice || maxPrice) {
      let range = {};
      if (minPrice) range.gte = parseFloat(minPrice);
      if (maxPrice) range.lte = parseFloat(maxPrice);
      esQuery.bool.filter.push({ range: { price: range } });
    }
    if (promotion !== undefined) esQuery.bool.filter.push({ term: { promotion: promotion === "true" } });
    if (minViews) esQuery.bool.filter.push({ range: { views: { gte: parseInt(minViews) } } });

    console.log('ES Query (full):', JSON.stringify(esQuery, null, 2));
    const response = await esClient.search({
      index: "products",
      body: { query: esQuery }
    });

    console.log('Full Elasticsearch response:', response);
    const hits = response.hits ? response.hits.hits.map(hit => hit._source) : [];
    console.log('Search response:', response.hits);
    console.log('Search results:', hits);
    res.json(hits);
  } catch (error) {
    console.error("❌ Lỗi khi tìm kiếm sản phẩm:", error.message);
    if (error.meta && error.meta.body) {
      console.error('Elasticsearch error details:', error.meta.body);
    }
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getProductsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query; // mặc định 9 sp / trang
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM products`);
    const total = countRows[0].total;

    res.json({
      products: rows,
      total,
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error("❌ Lỗi khi phân trang sản phẩm:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
