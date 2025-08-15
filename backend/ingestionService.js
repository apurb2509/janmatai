const axios = require('axios');
const { summarizeText } = require('./aiService');
require('dotenv').config();

async function fetchAndSummarize(topic) {
    console.log(`Starting news research for topic: ${topic}`);

    const url = `https://newsapi.org/v2/everything?` +
                `q=${encodeURIComponent(topic)}&` +
                `language=en&` +
                `sortBy=relevancy&` +
                `pageSize=10&` +
                `apiKey=${process.env.NEWS_API_KEY}`;
    
    const response = await axios.get(url);
    const articles = response.data.articles || [];

    if (articles.length === 0) {
        return `No recent news articles found for "${topic}".`;
    }

    const contentToSummarize = articles.map(article => 
        `Title: ${article.title}\nDescription: ${article.description}`
    ).join('\n\n---\n\n');

    const summary = await summarizeText(contentToSummarize, topic);
    
    return summary;
}

module.exports = { fetchAndSummarize };