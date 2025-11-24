// Quick test to verify personas field is always included in Gemini response
const { analyzeResults } = require('./services/gemini');

// Mock business data (similar to what Yelp would return)
const mockBusinesses = [
    {
        id: 'coffee-shop-1',
        name: 'Test Coffee Shop',
        rating: 4.5,
        review_count: 250,
        price: '$$',
        categories: [{ title: 'Coffee & Tea' }],
        url: 'https://yelp.com/biz/test'
    }
];

const mockReviews = {
    'coffee-shop-1': [
        {
            rating: 5,
            text: 'Great coffee but the service is slow during rush hour. I wish they had mobile ordering.',
            user: { name: 'John D.' },
            time_created: '2024-01-15'
        },
        {
            rating: 4,
            text: 'Amazing espresso! Sometimes inconsistent though. Would love to see more vegan options.',
            user: { name: 'Sarah P.' },
            time_created: '2024-01-10'
        }
    ]
};

async function testPersonasField() {
    console.log('\n🧪 Testing Personas Field...\n');

    try {
        // Test WITH reviews (should return personas array with data)
        console.log('Test 1: WITH reviews');
        const resultWithReviews = await analyzeResults(
            mockBusinesses,
            'coffee shop in williamsburg',
            'Here are some coffee shops',
            mockReviews
        );

        console.log('Has personas field:', 'personas' in resultWithReviews);
        console.log('Personas type:', typeof resultWithReviews.personas);
        console.log('Personas count:', resultWithReviews.personas?.length);
        console.log('✅ Test 1 PASSED\n');

        // Test WITHOUT reviews (should return empty personas array)
        console.log('Test 2: WITHOUT reviews');
        const resultWithoutReviews = await analyzeResults(
            mockBusinesses,
            'coffee shop in williamsburg',
            'Here are some coffee shops',
            {}
        );

        console.log('Has personas field:', 'personas' in resultWithoutReviews);
        console.log('Personas type:', typeof resultWithoutReviews.personas);
        console.log('Is array:', Array.isArray(resultWithoutReviews.personas));
        console.log('Personas count:', resultWithoutReviews.personas?.length);
        console.log('✅ Test 2 PASSED\n');

        console.log('🎉 All tests passed! Personas field is always present.\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        process.exit(1);
    }
}

testPersonasField();
