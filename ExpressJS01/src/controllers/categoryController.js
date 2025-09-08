const connection = require("../config/database");

exports.getAllCategories = async (req, res) => {
  try {
    const conn = await connection();
    const [rows] = await conn.execute("SELECT * FROM categories ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error(" Lỗi khi lấy danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await connection();
    const [rows] = await conn.execute("SELECT * FROM categories WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(" Lỗi khi lấy danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Tên danh mục là bắt buộc" });
    }

    const conn = await connection();
    const [result] = await conn.execute(
      "INSERT INTO categories (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    res.status(201).json({ message: " Danh mục đã được thêm", id: result.insertId });
  } catch (error) {
    console.error(" Lỗi khi thêm danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const conn = await connection();
    const [result] = await conn.execute(
      "UPDATE categories SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ message: " Cập nhật danh mục thành công" });
  } catch (error) {
    console.error(" Lỗi khi cập nhật danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await connection();
    const [result] = await conn.execute("DELETE FROM categories WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ message: " Đã xóa danh mục" });
  } catch (error) {
    console.error(" Lỗi khi xóa danh mục:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
