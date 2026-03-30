const { checkDynamoDBConnection } = require('./dynamodb');

const connectDB = async () => {
  try {
    const connected = await checkDynamoDBConnection();
    if (!connected) {
      throw new Error('DynamoDB connection check failed. Configure AWS credentials and retry.');
    }
    console.log(`✓ DynamoDB connected (region: ${process.env.AWS_REGION || 'ap-south-1'})`);
  } catch (error) {
    console.error(`✗ DynamoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
