import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config.js';

const startServer = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment.');
    }

    await mongoose.connect(config.mongoUri);

    console.log('✅ Production Database Connected');

    app.listen(config.port, () => {
      console.log(
        `🚀 Server running in ${config.env} mode on port ${config.port}`
      );
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();