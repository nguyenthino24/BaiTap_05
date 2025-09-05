const express = require("express");
const router = express.Router();
const Category = require("../models/category");


router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.createCategory(name, description);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.updateCategory(req.params.id, name, description);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Category.deleteCategory(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
