const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// /v1/api/products
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
router.get("/with-category", productController.getProductsWithCategories);
router.get("/search", productController.searchProducts);
router.get("/paginated", productController.getProductsPaginated);

// Favorites
router.post("/favorites", productController.addFavorite);
router.delete("/favorites", productController.removeFavorite);
router.get("/favorites/:userId", productController.getFavorites);

// Similar products
router.get("/similar/:productId", productController.getSimilarProducts);

// Viewed products
router.get("/viewed", productController.getViewedProducts);

// Buyer and commenter counts
router.get("/counts/:productId", productController.getBuyerCommenterCounts);

module.exports = router;
