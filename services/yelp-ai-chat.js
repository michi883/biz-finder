const axios = require('axios');
require('dotenv').config();

const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_AI_CHAT_URL = 'https://api.yelp.com/ai/chat/v2';

const queryYelpAI = async (userQuery, userContext = {}) => {
    try {
        const payload = {
            query: userQuery,
            user_context: {
                locale: userContext.locale || 'en_US',
                latitude: userContext.latitude || 40.7128,  // Default to NYC
                longitude: userContext.longitude || -74.0060
            }
        };

        // Include chat_id if provided (for multi-turn conversations)
        if (userContext.chat_id) {
            payload.chat_id = userContext.chat_id;
        }

        const response = await axios.post(YELP_AI_CHAT_URL, payload, {
            headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract businesses from the response
        let businesses = [];

        // Option 1: business_results[].search_results.businesses
        if (response.data.response?.business_results) {
            for (const result of response.data.response.business_results) {
                if (result.search_results?.businesses) {
                    businesses = businesses.concat(result.search_results.businesses);
                } else if (result.businesses) {
                    businesses = businesses.concat(result.businesses);
                }
            }
        }

        // Option 2: Extract business IDs from tags
        const businessIds = [];
        if (response.data.response?.tags) {
            for (const tag of response.data.response.tags) {
                if (tag.tag_type === 'business' && tag.meta?.business_id) {
                    businessIds.push(tag.meta.business_id);
                }
            }
        }



        return {
            chat_id: response.data.chat_id,
            conversational_response: response.data.response?.text || '',
            businesses: businesses,
            business_ids: businessIds,  // For potential follow-up queries
            raw_response: response.data
        };

    } catch (error) {
        console.error('Error querying Yelp AI Chat:', error.response?.data || error.message);
        throw new Error('Failed to query Yelp AI Chat API');
    }
};

const fetchBusinessDetails = async (businessIds) => {
    const businesses = [];

    for (const businessId of businessIds) {
        try {
            const response = await axios.get(`https://api.yelp.com/v3/businesses/${businessId}`, {
                headers: {
                    'Authorization': `Bearer ${YELP_API_KEY}`
                }
            });

            businesses.push(response.data);
        } catch (error) {
            console.error(`Failed to fetch business ${businessId}:`, error.response?.data || error.message);
        }
    }



    return businesses;
};

const fetchReviews = async (businessIds) => {
    const allReviews = {};

    for (const businessId of businessIds) {
        try {
            const response = await axios.get(`https://api.yelp.com/v3/businesses/${businessId}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${YELP_API_KEY}`
                },
                params: {
                    limit: 3  // Yelp API max is 3 reviews per business
                }
            });

            allReviews[businessId] = response.data.reviews;
        } catch (error) {
            console.error(`Failed to fetch reviews for ${businessId}:`, error.response?.data || error.message);
            allReviews[businessId] = [];
        }
    }

    const totalReviews = Object.values(allReviews).reduce((sum, reviews) => sum + reviews.length, 0);


    return allReviews;
};

module.exports = { queryYelpAI, fetchBusinessDetails, fetchReviews };
