const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200',  // Thay bằng URL Elasticsearch của bạn
  // Nếu có auth: auth: { username: 'elastic', password: 'your_password' }
});

module.exports = esClient;