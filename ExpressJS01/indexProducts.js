const esClient = require('./src/config/elasticsearch');
const { pool } = require('./src/config/database'); // Sửa đường dẫn từ user sang database

async function indexProducts() {
  try {
    // Kiểm tra kết nối Elasticsearch
    const health = await esClient.cluster.health();
    console.log('✅ Elasticsearch connected:', health.body.status);

    // Tạo index nếu chưa tồn tại
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists.body) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text', analyzer: 'standard' },
              brand: { type: 'text', analyzer: 'standard' },
              price: { type: 'float' },
              image_url: { type: 'text' },
              category_id: { type: 'integer' },
              category_name: { type: 'text', analyzer: 'standard' },
              promotion: { type: 'boolean' },
              views: { type: 'integer' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('✅ Created products index');
    }

    // Lấy tất cả sản phẩm từ database
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);

    console.log(`📊 Found ${rows.length} products to index`);

    // Index từng sản phẩm
    for (const product of rows) {
      await esClient.index({
        index: 'products',
        id: product.id.toString(),
        body: {
          id: product.id,
          name: product.name || '',
          brand: product.brand || '',
          price: parseFloat(product.price) || 0,
          image_url: product.image_url || '',
          category_id: product.category_id || null,
          category_name: product.category_name || 'Chưa có',
          promotion: !!product.promotion,
          views: product.views || 0,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString()
        }
      });
    }

    // Refresh index
    await esClient.indices.refresh({ index: 'products' });
    console.log('✅ Successfully indexed all products');

    // Kiểm tra số lượng documents
    const count = await esClient.count({ index: 'products' });
    console.log(`📊 Total indexed products: ${count.body.count}`);

  } catch (error) {
    console.error('❌ Error indexing products:', error.stack || error.message);
  } finally {
    await pool.end(); // Đóng kết nối MySQL
    process.exit(0);
  }
}

indexProducts();