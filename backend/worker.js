const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { fetchAndSummarize } = require('./ingestionService');
const { extractArgument, getEmbedding } = require('./aiService');
const pool = require('./db');
require('dotenv').config();

if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error('Upstash Redis connection URL is not defined in .env file');
}

const connection = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
});

async function processAndStoreText(source_text) {
  if (!source_text || source_text.startsWith("No recent news articles found for")) {
    console.log(`Worker: Skipping storage for empty content.`);
    return;
  }
  const extracted_argument = await extractArgument(source_text);
  if (!extracted_argument || extracted_argument === "Failed to extract argument.") {
    throw new Error('Worker: Could not extract argument from text.');
  }
  const embedding = await getEmbedding(extracted_argument);
  if (!embedding) {
    throw new Error('Worker: Could not generate embedding for argument.');
  }
  const insertQuery = 'INSERT INTO arguments(source_text, extracted_argument, embedding) VALUES($1, $2, $3)';
  const values = [source_text, extracted_argument, `[${embedding.join(',')}]`];
  await pool.query(insertQuery, values);
}

const worker = new Worker('ingestion-queue', async job => {
  const { topic } = job.data;
  console.log(`Worker: Processing job for topic: "${topic}"`);
  try {
    const summary = await fetchAndSummarize(topic);
    await processAndStoreText(summary);
    console.log(`Worker: Successfully processed and stored summary for topic: "${topic}"`);
  } catch (error) {
    console.error(`Worker: Job for topic "${topic}" failed.`, error);
    throw error;
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

console.log('Dedicated Ingestion Worker is running and listening for jobs...');