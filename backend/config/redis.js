const Redis = require('ioredis');

// Setup Redis instance with retry tracking handles
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay; // Exponential backoff retries
  },
});

redis.on('connect', () => console.log('🧠 Redis Cache Cluster Connected'));
redis.on('error', (err) => console.error('❌ Redis Connection Error:', err.message));

module.exports = redis;