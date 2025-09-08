// controllers/categoryController.js
const Category = require("../models/category");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh mục theo ID:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    const created = await Category.createCategory(name, description);
    res.status(201).json({ message: "✅ Danh mục đã được thêm", category: created });
  } catch (error) {
    console.error("❌ Lỗi khi thêm danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const updated = await Category.updateCategory(req.params.id, name, description);
    res.json({ message: "✅ Cập nhật danh mục thành công", category: updated });
  } catch (error) {
    const msg = error?.message === "Không tìm thấy danh mục" ? 404 : 500;
    res.status(msg).json({ message: error.message || "Lỗi server" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.deleteCategory(req.params.id);
    res.json({ message: "🗑️ Đã xóa danh mục" });
  } catch (error) {
    const msg = error?.message === "Không tìm thấy danh mục" ? 404 : 500;
    res.status(msg).json({ message: error.message || "Lỗi server" });
  }
};
