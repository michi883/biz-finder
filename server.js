const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { queryYelpAI, fetchBusinessDetails, fetchReviews } = require('./services/yelp-ai-chat');
const { analyzeResults } = require('./services/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://biz.sound.fan', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.static('public'));

app.post('/analyze', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Received query: ${query}`);

    try {
        // Step 1: Query Yelp AI Chat for natural language understanding + business discovery
        const yelpResult = await queryYelpAI(query, {
            latitude: 40.7128,  // Default to NYC
            longitude: -74.0060
        });

        // Step 1.5: If no businesses but we have IDs, fetch business details
        let businesses = yelpResult.businesses;

        if ((!businesses || businesses.length === 0) && yelpResult.business_ids && yelpResult.business_ids.length > 0) {
            businesses = await fetchBusinessDetails(yelpResult.business_ids);
        }

        if (!businesses || businesses.length === 0) {
            return res.status(404).json({
                error: 'No competitors found to analyze.',
                yelp_response: yelpResult.conversational_response
            });
        }

        // Step 1.75: Fetch reviews for deeper analysis
        const reviews = await fetchReviews(yelpResult.business_ids || businesses.map(b => b.id));

        // Step 2: Analyze with Gemini for competitive insights
        const analysisResult = await analyzeResults(
            businesses,
            query,
            yelpResult.conversational_response,
            reviews
        );

        // Step 3: Combine responses
        console.log('📊 Analysis Result Keys:', Object.keys(analysisResult));
        console.log('👥 Personas in analysisResult:', analysisResult.personas);
        console.log('👥 Personas length:', analysisResult.personas?.length);

        const response = {
            ...analysisResult,
            yelp_insight: yelpResult.conversational_response,
            chat_id: yelpResult.chat_id,
            reviews: reviews  // Include reviews for frontend display
        };

        console.log('📦 Response Keys:', Object.keys(response));
        console.log('👥 Personas in response:', response.personas);
        console.log(`Market Analysis: ${analysisResult.summary}`);

        res.json(response);

    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: 'Failed to analyze market opportunity.' });
    }
});

const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(PORT);
