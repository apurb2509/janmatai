const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error('Upstash Redis connection URL is not defined in .env file');
}

const connection = new Redis(process.env.UPSTASH_REDIS_URL, {
    maxRetriesPerRequest: null,
});

const ingestionQueue = new Queue('ingestion-queue', {
  connection,
});

module.exports = { ingestionQueue };