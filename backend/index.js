const express = require('express');
const cors = require('cors');
const pool = require('./db');
// This line is now corrected to include all necessary functions
const { extractArgument, getEmbedding, generateChatResponse, summarizeText, generateGeneralResponse } = require('./aiService');
const clustering = require('density-clustering');
const snoowrap = require('snoowrap');
const { fetchAndSummarize } = require('./ingestionService');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function processAndStoreText(source_text) {
  if (!source_text) {
    throw new Error('Source text is empty.');
  }
  const extracted_argument = await extractArgument(source_text);
  if (!extracted_argument || extracted_argument === "Failed to extract argument.") {
    throw new Error('Could not extract argument from text.');
  }
  const embedding = await getEmbedding(extracted_argument);
  if (!embedding) {
    throw new Error('Could not generate embedding for argument.');
  }
  const insertQuery = 'INSERT INTO arguments(source_text, extracted_argument, embedding) VALUES($1, $2, $3)';
  const values = [source_text, extracted_argument, `[${embedding.join(',')}]`];
  await pool.query(insertQuery, values);
}

app.post('/ingest-research', async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required.' });
        }
        const summary = await fetchAndSummarize(topic);
        await processAndStoreText(summary);
        res.status(200).json({ message: `Successfully researched and ingested summary for "${topic}".` });
    } catch (error) {
        console.error('Research ingestion error:', error);
        res.status(500).json({ error: 'Failed to ingest research data.' });
    }
});

app.post('/ingest-reddit', async (req, res) => {
  try {
    const { topic, subreddit } = req.body;
    if (!topic || !subreddit) {
      return res.status(400).json({ error: 'Topic and subreddit are required.' });
    }
    const r = new snoowrap({
        userAgent: 'JanmatAI/1.0',
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD
    });
    const posts = await r.getSubreddit(subreddit).search({ query: topic, limit: 10, sort: 'relevance', time: 'all' });
    const processingPromises = posts.map(post => processAndStoreText(post.title));
    const results = await Promise.allSettled(processingPromises);
    const successfulPosts = results.filter(r => r.status === 'fulfilled').length;
    res.status(200).json({ message: `Successfully ingested and processed ${successfulPosts} out of ${posts.length} posts.` });
  } catch (error) {
    console.error('Reddit ingestion error:', error);
    res.status(500).json({ error: 'Failed to ingest data from Reddit.' });
  }
});

app.post('/process', async (req, res) => {
  try {
    const { text } = req.body;
    await processAndStoreText(text);
    const argument = await extractArgument(text); 
    res.status(201).json({ 
      message: "Processing successful",
      argument: argument
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during processing.' });
  }
});

app.get('/arguments', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT id, extracted_argument, cluster_id FROM arguments';
    const queryParams = [];
    if (startDate && endDate) {
      query += ' WHERE created_at >= $1 AND created_at <= $2';
      queryParams.push(startDate, endDate);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch arguments:', error);
    res.status(500).json({ error: 'Failed to fetch arguments' });
  }
});

app.post('/cluster', async (req, res) => {
    try {
        const vectorsResult = await pool.query('SELECT id, embedding FROM arguments');
        if (vectorsResult.rows.length < 2) { 
            return res.json({ message: 'Not enough arguments to cluster.' });
        }
        const points = vectorsResult.rows.map(row => JSON.parse(row.embedding));
        const ids = vectorsResult.rows.map(row => row.id);
        const dbscan = new clustering.DBSCAN();
        const clusters = dbscan.run(points, 0.7, 2);
        const assignments = new Array(points.length).fill(-1);
        clusters.forEach((cluster, clusterIndex) => {
            cluster.forEach(pointIndex => {
                assignments[pointIndex] = clusterIndex;
            });
        });
        const client = await pool.connect();
        await client.query('BEGIN');
        await client.query('UPDATE arguments SET cluster_id = NULL');
        for (let i = 0; i < ids.length; i++) {
            const clusterId = assignments[i];
            const pointId = ids[i];
            await client.query('UPDATE arguments SET cluster_id = $1 WHERE id = $2', [clusterId, pointId]);
        }
        await client.query('COMMIT');
        client.release();
        res.json({ message: 'Clustering successful!', clustersFound: clusters.length });
    } catch(error) {
        console.error('Clustering process failed:', error);
        res.status(500).json({ error: 'Clustering process failed.' });
    }
});

app.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const queryEmbedding = await getEmbedding(question);
    if (!queryEmbedding) {
      return res.status(500).json({ error: 'Failed to create embedding for the question.' });
    }
    const contextResult = await pool.query("SELECT * FROM match_arguments($1, 0.5, 5)", [`[${queryEmbedding.join(',')}]`]);
    const context = contextResult.rows;
    let answer;
    if (context.length === 0) {
      console.log("No context found in DB. Falling back to general response.");
      answer = await generateGeneralResponse(question);
    } else {
      console.log(`Found ${context.length} relevant documents in DB. Generating RAG response.`);
      answer = await generateChatResponse(question, context);
    }
    res.json({ answer });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process chat request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});
