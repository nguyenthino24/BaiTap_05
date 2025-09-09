const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200',  // Thay bằng URL Elasticsearch của bạn
  // Nếu có auth: auth: { username: 'elastic', password: 'your_password' }
});

// Khởi tạo index Elasticsearch với mapping (chỉ tạo nếu chưa tồn tại)
async function initializeElasticsearch() {
  try {
    const indexExists = await esClient.indices.exists({ index: 'products' });
    if (!indexExists.body) {
      // Tạo index mới với mapping chỉ khi chưa tồn tại
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              id: { type: 'integer' },
              name: { type: 'text' },
              brand: { type: 'text' },
              price: { type: 'float' },
              image_url: { type: 'keyword' },
              category_id: { type: 'integer' },
              category_name: { type: 'text' },
              promotion: { type: 'boolean' },
              views: { type: 'integer' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' }
            }
          }
        }
      });
      console.log('✅ Index products đã được tạo.');
    } else {
      console.log('✅ Index products đã tồn tại.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra/tạo index products:', error.message);
  }
}

initializeElasticsearch();

module.exports = esClient;
