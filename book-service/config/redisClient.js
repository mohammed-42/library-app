const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

const connectRedis = async () => {
  await client.connect();
};

module.exports = { client, connectRedis };