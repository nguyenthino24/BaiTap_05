const axios = require('axios');

const BASE_URL = 'http://localhost:8888/v1/api';

async function testSearchAPI() {
  try {
    console.log('🧪 Testing Product Search API...\n');

    // Test 1: Tìm kiếm tất cả sản phẩm
    console.log('1. Testing get all products:');
    const allProducts = await axios.get(`${BASE_URL}/products/with-category`);
    console.log(`   ✅ Found ${allProducts.data.length} products\n`);

    // Test 2: Tìm kiếm với từ khóa
    console.log('2. Testing search with query "iPhone":');
    const searchResults = await axios.get(`${BASE_URL}/products/search`, { params: { query: 'iPhone' } });
    console.log(`   ✅ Found ${searchResults.data.length} results for "iPhone"\n`);

    // Test 3: Tìm kiếm theo danh mục
    console.log('3. Testing search by category (ID: 1):');
    const categoryResults = await axios.get(`${BASE_URL}/products/search`, { params: { category: 1 } });
    console.log(`   ✅ Found ${categoryResults.data.length} results in category 1\n`);

    // Test 4: Tìm kiếm theo khoảng giá
    console.log('4. Testing search by price range (10M - 30M):');
    const priceResults = await axios.get(`${BASE_URL}/products/search`, { params: { minPrice: 10000000, maxPrice: 30000000 } });
    console.log(`   ✅ Found ${priceResults.data.length} results in price range\n`);

    // Test 5: Tìm kiếm có khuyến mãi
    console.log('5. Testing search with promotion:');
    const promoResults = await axios.get(`${BASE_URL}/products/search`, { params: { promotion: 'true' } });
    console.log(`   ✅ Found ${promoResults.data.length} promotional products\n`);

    // Test 6: Tìm kiếm theo lượt xem tối thiểu
    console.log('6. Testing search with min views (100):');
    const viewsResults = await axios.get(`${BASE_URL}/products/search`, { params: { minViews: 100 } });
    console.log(`   ✅ Found ${viewsResults.data.length} products with min views 100\n`);

    // Test 7: Tìm kiếm kết hợp
    console.log('7. Testing combined search:');
    const combinedResults = await axios.get(`${BASE_URL}/products/search`, {
      params: { query: 'Samsung', category: 1, minPrice: 15000000, maxPrice: 25000000, promotion: 'true', minViews: 50 }
    });
    console.log(`   ✅ Found ${combinedResults.data.length} results with combined filters\n`);

    console.log('🎉 All search tests completed successfully!');

  } catch (error) {
    console.error('❌ Search test failed:', error.response?.data || error.message);
  }
}

testSearchAPI();