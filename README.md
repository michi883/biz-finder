# Business Opportunity Finder 🚀

An AI-powered market analysis tool that helps entrepreneurs identify business opportunities by analyzing local competitors, customer reviews, and market gaps.

![App Screenshot](https://via.placeholder.com/800x400?text=Business+Opportunity+Finder+Screenshot)

## ✨ Features

- **Market Gap Analysis**: Uses Google Gemini AI to analyze competitor data and identify underserved market needs.
- **Competitor Weakness Heatmap**: Visualizes competitor strengths and weaknesses across key criteria (Service Speed, Price Fairness, Product Quality, Ambiance, Reliability).
- **Customer Personas**: Generates detailed customer personas based on actual reviews, highlighting demographics, goals, and pain points.
- **Review Analysis**: Aggregates and analyzes customer reviews to extract common themes and sentiment.
- **Yelp Integration**: Real-time business data fetching using the Yelp Fusion API.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML, CSS (Custom Design System), JavaScript
- **Backend**: Node.js, Express
- **AI/ML**: Google Gemini API (Generative AI), Yelp Fusion API (Data)
- **Deployment**: Google Cloud Run ready

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A Yelp Fusion API Key
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-opportunity-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   YELP_API_KEY=your_yelp_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the application**
   Visit `http://localhost:3000` in your browser.

## 💡 Usage

1. Enter a business question in the search box (e.g., *"Would a high speed coffee shop work in Williamsburg?"*).
2. Click **Analyze Market**.
3. View the AI-generated **Market Analysis Summary**.
4. Explore the **Competitor Weakness Heatmap** to see where rivals are failing.
5. Review the **Customer Personas** to understand your potential target audience.
6. Read through **Customer Reviews** for deeper insights.

## 📂 Project Structure

- `public/`: Frontend files (HTML, CSS, JS)
- `services/`: Backend services (Gemini AI, Yelp API)
- `server.js`: Main Express server application
- `test-personas.js`: Utility script to test persona generation

## 📄 License

MIT License
