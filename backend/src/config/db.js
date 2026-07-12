const { Pool } = require('pg');
const env = require('./env');

const shouldUseSsl = !env.databaseUrl.includes('localhost') && !env.databaseUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
});

module.exports = pool;
