const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// /v1/api/products
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
router.get("/with-category", productController.getProductsWithCategories);
router.get("/search", productController.searchProducts);
router.get("/paginated", productController.getProductsPaginated);
module.exports = router;
