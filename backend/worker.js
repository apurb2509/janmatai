const cron = require('node-cron');
const { fetchAndSummarize } = require('./ingestionService');
const { extractArgument, getEmbedding } = require('./aiService');
const pool = require('./db');

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

async function processAndStoreText(source_text) {
  if (!source_text || source_text.startsWith("No recent news articles found for")) {
    console.log("Worker: Skipping storage due to no new content.");
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
  console.log(`Worker: Successfully processed and stored summary for topic: "${TOPICS_TO_TRACK[currentTopicIndex]}"`);
}

const startWorker = () => {
  console.log('Automated Ingestion Worker has started. Will run once every hour.');

  cron.schedule('0 * * * *', async () => {
    try {
      const topic = TOPICS_TO_TRACK[currentTopicIndex];
      console.log(`Worker: Running hourly job for topic: "${topic}"`);

      const summary = await fetchAndSummarize(topic);
      await processAndStoreText(summary);

      currentTopicIndex = (currentTopicIndex + 1) % TOPICS_TO_TRACK.length;

    } catch (error) {
      console.error("Worker: An error occurred during the automated ingestion job:", error);
    }
  });
};

module.exports = { startWorker };