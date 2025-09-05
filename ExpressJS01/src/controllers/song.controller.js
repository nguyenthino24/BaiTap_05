const connection = require("../config/database");

exports.getAllSongs = async (req, res) => {
  try {
    const conn = await connection();
    const [rows] = await conn.execute(
      `SELECT songs.*, categories.name AS category_name
       FROM songs 
       LEFT JOIN categories ON songs.category_id = categories.id`
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createSong = async (req, res) => {
  try {
    const { title, artist, audio_url, image_url, category_id } = req.body;

    if (!title || !artist) {
      return res.status(400).json({ message: "Thiếu thông tin bài hát" });
    }

    const conn = await connection();
    await conn.execute(
      `INSERT INTO songs (title, artist, audio_url, image_url, category_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, artist, audio_url, image_url, category_id]
    );

    res.status(201).json({ message: "✅ Bài hát đã được thêm" });
  } catch (error) {
    console.error("❌ Lỗi khi thêm bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};
exports.getSongsWithCategories = async (req, res) => {
  try {
    const conn = await connection();
    const [rows] = await conn.execute(`
      SELECT s.id, s.title, s.artist, s.audio_url, s.image_url, 
             c.name AS category_name
      FROM songs s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY c.name, s.title
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách bài hát:", error.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};

