const connection = require("../config/db"); 

async function getAllCategories() {
  const conn = await connection();
  const [rows] = await conn.execute("SELECT * FROM categories");
  return rows;
}


async function createCategory(name, description) {
  const conn = await connection();
  const [result] = await conn.execute(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );
  return { id: result.insertId, name, description };
}


async function getCategoryById(id) {
  const conn = await connection();
  const [rows] = await conn.execute("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0];
}


async function updateCategory(id, name, description) {
  const conn = await connection();
  await conn.execute(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name, description, id]
  );
  return { id, name, description };
}


async function deleteCategory(id) {
  const conn = await connection();
  await conn.execute("DELETE FROM categories WHERE id = ?", [id]);
  return true;
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};
