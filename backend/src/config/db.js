const mongoose = require('mongoose');

const connectDB = async () => {
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/';
  const dbName = process.env.MONGO_DB_NAME || 'placify_auth';

  const connection = await mongoose.connect(mongoUri, {
    dbName,
  });

  console.log(`MongoDB connected: ${connection.connection.host}/${dbName}`);
};

module.exports = connectDB;
