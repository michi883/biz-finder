const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResults = async (businesses, userQuery, yelpResponse = '', reviews = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare business data for the prompt (simplify to save tokens/reduce noise)
    const businessData = businesses.map(b => ({
      id: b.id,
      name: b.name,
      rating: b.rating,
      review_count: b.review_count,
      price: b.price,
      categories: b.categories.map(c => c.title).join(', '),
      url: b.url
    }));

    // Prepare review data if available
    let reviewSection = '';
    if (reviews && Object.keys(reviews).length > 0) {
      reviewSection = '\n\nCustomer Reviews:\n';
      businesses.forEach(b => {
        const businessReviews = reviews[b.id] || [];
        if (businessReviews.length > 0) {
          reviewSection += `\n${b.name}:\n`;
          businessReviews.forEach((review, idx) => {
            reviewSection += `  Review ${idx + 1} (${review.rating}⭐): "${review.text}"\n`;
          });
        }
      });
    }

    const prompt = `
    You are a Business Opportunity Analyst. 
    
    The user asked: "${userQuery}"
    
    ${yelpResponse ? `Yelp AI responded: "${yelpResponse}"\n` : ''}
    
    Analyze the following list of competitors found on Yelp:
    ${JSON.stringify(businessData, null, 2)}
    ${reviewSection}
    
    Your task:
    1. Identify the top 3 most relevant competitors from the list.
    2. ${reviewSection ? 'Analyze customer reviews to identify common complaints, strengths, and market gaps.' : 'Analyze market gaps based on their ratings, prices, and review counts.'}
    3. Assign scores (1-5) for the following criteria for each of the top 3 competitors:
       - Service Speed ${reviewSection ? '(Based on review mentions of wait times, efficiency)' : '(Infer from business type/rating)'}
       - Price Fairness ${reviewSection ? '(Based on review mentions of value, pricing complaints)' : '(Inverse of price symbol? High rating + Low price = 5)'}
       - Product Quality ${reviewSection ? '(Based on review mentions of quality, taste, performance)' : '(Correlate with Rating)'}
       - Ambiance ${reviewSection ? '(Based on review mentions of atmosphere, decor, comfort)' : '(Infer from category/price)'}
       - Reliability ${reviewSection ? '(Based on review mentions of consistency, service quality)' : '(Correlate with Review Count/Rating)'}
    4. Write a strategic "Market Analysis Summary" (2-3 sentences) that goes BEYOND what Yelp said. 
       ${reviewSection ? 'Focus on specific themes from reviews (e.g., "customers complain about X", "gap in Y").' : 'Focus on competitive gaps and opportunities for a new entrant.'}
    ${reviewSection ? `5. Extract 2-3 distinct CUSTOMER PERSONAS from the reviews. For each persona:
       - Create a descriptive name (e.g., "The Busy Professional", "The Coffee Enthusiast", "The Remote Worker")
       - Identify demographic characteristics (age range, lifestyle, occupation type)
       - List 2-3 main goals/motivations for visiting these businesses
       - List 2-3 pain points with DIRECT QUOTES from actual reviews as evidence
       - List 2-3 preferences or desires mentioned in reviews
       Make personas distinct from each other, representing different customer segments.` : ''}

    CRITICAL: Return ONLY a valid JSON object with NO additional text before or after. 
    ${reviewSection ? 'You MUST include the "personas" array with 2-3 distinct personas based on the reviews.' : 'You MUST include "personas" as an empty array: []'}
    NEVER omit the "personas" field - it must ALWAYS be present in your response. 
    
    Use this EXACT structure:
    {
      "summary": "Strategic summary text...",
      "criteria": [
        { "id": "c1", "label": "Service Speed", "description": "Efficiency of service delivery" },
        { "id": "c2", "label": "Price Fairness", "description": "Value for money" },
        { "id": "c3", "label": "Product Quality", "description": "Taste and freshness of the product" },
        { "id": "c4", "label": "Ambiance", "description": "Atmosphere and comfort" },
        { "id": "c5", "label": "Reliability", "description": "Consistency of experience" }
      ],
      "competitors": [
        {
          "id": "business-id-from-data",
          "name": "Competitor Name",
          "yelpUrl": "URL from data",
          "scores": { "c1": 5, "c2": 3, "c3": 4, "c4": 5, "c5": 4 }
        }
      ],
      "personas": [
        {
          "name": "The Busy Professional",
          "demographic": "Ages 28-40, working professionals seeking convenience",
          "goals": ["Quick service during work breaks", "Consistent quality", "Proximity to office"],
          "painPoints": [
            { "point": "Long wait times", "quote": "Waited 15 minutes just for a simple coffee order" },
            { "point": "Inconsistent quality", "quote": "Sometimes it's great, sometimes it's burnt" }
          ],
          "preferences": ["Mobile ordering", "Loyalty programs", "Multiple payment options"]
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text and extract just the JSON
    let cleanText = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Try to extract JSON object using regex (find content between outermost { and })
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON object found in response');
      console.error('📄 Full response:', cleanText);
      throw new Error('No valid JSON found in Gemini response');
    }

    let jsonString = jsonMatch[0];

    // Log the raw response for debugging (truncated)
    console.log('📝 Extracted JSON (first 500 chars):', jsonString.substring(0, 500));
    console.log('📏 JSON length:', jsonString.length);

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonString);
      console.log('✅ JSON parsed successfully on first attempt');
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('📍 Error position:', parseError.message.match(/position (\d+)/)?.[1]);

      // Show problematic area
      const errorPos = parseInt(parseError.message.match(/position (\d+)/)?.[1] || '0');
      const start = Math.max(0, errorPos - 100);
      const end = Math.min(jsonString.length, errorPos + 100);
      console.error('📄 Around error position:', jsonString.substring(start, end));

      // Try to fix common JSON issues
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
        .replace(/:\s*'([^']*)'/g, ': "$1"');  // Replace single quotes with double quotes

      // Try parsing again
      try {
        parsedResult = JSON.parse(jsonString);
        console.log('✅ JSON fixed and parsed successfully after cleanup');
      } catch (secondError) {
        console.error('❌ Still failed after cleanup:', secondError.message);
        // Log the full JSON for manual inspection
        console.error('📄 Full JSON:', jsonString);
        throw parseError;  // Throw the original error
      }
    }

    // Ensure personas field always exists (even if Gemini doesn't include it)
    if (!parsedResult.personas) {
      console.log('⚠️  Gemini response missing personas field, adding empty array');
      parsedResult.personas = [];
    }

    console.log(`✅ Analysis complete: ${parsedResult.competitors?.length || 0} competitors, ${parsedResult.personas?.length || 0} personas`);

    return parsedResult;

  } catch (error) {
    console.error("❌ Error analyzing results with Gemini:", error);
    throw new Error("Failed to generate market analysis");
  }
};

module.exports = { analyzeResults };
