const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractArgument(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Analyze this comment. Summarize the user's core viewpoint or argument in a single, neutral sentence. Here is the comment: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const argument = response.text();
    return argument;
  } catch (error) {
    console.error("Error in AI service (extractArgument):", error);
    return "Failed to extract argument.";
  }
}

async function getEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (error) {
    console.error("Error in AI service (getEmbedding):", error);
    return null;
  }
}

async function generateChatResponse(question, context) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const contextText = context.map(c => `- ${c.extracted_argument}`).join('\n');
    
    const prompt = `You are an expert analyst for the Janmat AI platform. Your task is to answer the user's question based ONLY on the provided context of public opinions. Do not use any outside knowledge. If the context does not contain enough information to answer the question, state that clearly.

Context of public opinions:
${contextText}

User's Question: "${question}"

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();
    return answer;
  } catch (error) {
    console.error("Error in AI service (generateChatResponse):", error);
    return "I'm sorry, I encountered an error while generating a response.";
  }
}

async function summarizeText(textToSummarize, topic) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Based on the following raw search results, provide a comprehensive, well-structured, and unbiased summary of the topic: "${topic}". Synthesize the information into a clear narrative.

Search Results:
---
${textToSummarize}
---

Comprehensive Summary:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in AI service (summarizeText):", error);
    return `Failed to summarize text for topic: ${topic}`;
  }
}

module.exports = { extractArgument, getEmbedding, generateChatResponse, summarizeText };