const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { extractArgument, getEmbedding, generateChatResponse, summarizeText, generateGeneralResponse } = require('./aiService');
const clustering = require('density-clustering');
const snoowrap = require('snoowrap');
const { fetchAndSummarize } = require('./ingestionService');
const { ingestionQueue } = require('./queue');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

async function processAndStoreText(source_text) {
  if (!source_text || source_text.startsWith("No recent news articles found for")) {
    throw new Error(source_text || 'No content was generated to process.');
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

app.post('/submit-suggestion', async (req, res) => {
    try {
        const { name, age, description_tags, suggestion_text } = req.body;
        if (!description_tags || description_tags.length === 0 || !suggestion_text) {
            return res.status(400).json({ error: 'Description tags and suggestion text are required.' });
        }
        const insertQuery = 'INSERT INTO suggestions(name, age, description_tags, suggestion_text) VALUES($1, $2, $3, $4)';
        await pool.query(insertQuery, [name || null, age || null, description_tags, suggestion_text]);
        res.status(201).json({ message: 'Suggestion submitted successfully. Thank you!' });
    } catch (error) {
        console.error('Failed to submit suggestion:', error);
        res.status(500).json({ error: 'Failed to submit suggestion.' });
    }
});

app.post('/log-activity', async (req, res) => {
    try {
        const { userId, fullName, email, eventType } = req.body;
        if (!userId || !eventType) { return res.status(400).json({ error: 'User ID and event type are required.' }); }
        const insertQuery = 'INSERT INTO user_activity(user_id, full_name, email, event_type) VALUES($1, $2, $3, $4)';
        await pool.query(insertQuery, [userId, fullName, email, eventType]);
        res.status(200).json({ message: 'Activity logged successfully.' });
    } catch (error) {
        console.error('Failed to log user activity:', error);
        res.status(500).json({ error: 'Failed to log activity.' });
    }
});

app.post('/ingest-research', async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) { return res.status(400).json({ error: 'Topic is required.' }); }
        await ingestionQueue.add('ingest-topic', { topic });
        res.status(202).json({ message: `Research job for "${topic}" has been added to the queue.` });
    } catch (error) {
        console.error('Failed to add job to queue:', error);
        res.status(500).json({ error: 'Failed to add job to queue.' });
    }
});

app.post('/process', async (req, res) => {
  try {
    const { text } = req.body;
    await processAndStoreText(text);
    const argument = await extractArgument(text); 
    res.status(201).json({ message: "Processing successful", argument: argument });
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
        if (vectorsResult.rows.length < 2) { return res.json({ message: 'Not enough arguments to cluster.' }); }
        const points = vectorsResult.rows.map(row => JSON.parse(row.embedding));
        const ids = vectorsResult.rows.map(row => row.id);
        const dbscan = new clustering.DBSCAN();
        const clusters = dbscan.run(points, 0.7, 2);
        const assignments = new Array(points.length).fill(-1);
        clusters.forEach((cluster, clusterIndex) => {
            cluster.forEach(pointIndex => { assignments[pointIndex] = clusterIndex; });
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
    if (!question) { return res.status(400).json({ error: 'Question is required' }); }
    const queryEmbedding = await getEmbedding(question);
    if (!queryEmbedding) { return res.status(500).json({ error: 'Failed to create embedding for the question.' }); }
    const contextResult = await pool.query("SELECT * FROM match_arguments($1, 0.5, 5)", [`[${queryEmbedding.join(',')}]`]);
    const context = contextResult.rows;
    let answer;
    if (context.length === 0) {
      answer = await generateGeneralResponse(question);
    } else {
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

const TOPICS_TO_TRACK = [
    "global economic trends",
    "latest advancements in artificial intelligence",
    "breakthroughs in renewable energy",
    "geopolitical analysis south china sea",
    "pharmaceutical research and development",
    "future of space exploration",
    "semiconductor industry news"
];
let currentTopicIndex = 0;

cron.schedule('0 * * * *', async () => {
  try {
    const topic = TOPICS_TO_TRACK[currentTopicIndex];
    console.log(`Scheduler: Adding hourly job for topic: "${topic}" to the queue.`);
    await ingestionQueue.add('ingest-topic', { topic });
    currentTopicIndex = (currentTopicIndex + 1) % TOPICS_TO_TRACK.length;
  } catch (error) {
    console.error("Scheduler: Failed to add hourly job to queue:", error);
  }
});
