const app = require('./app');
const env = require('./config/env');
const { createSchema } = require('./db/schema');
const { seedDatabase } = require('./db/seed');

const start = async () => {
  try {
    await createSchema();
    await seedDatabase();

    app.listen(env.port, () => {
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
};

start();
