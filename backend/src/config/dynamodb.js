const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

// Initialize DynamoDB Document Client for easier operations
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Table names
const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || "PlacifyUsers",
  POSTS: process.env.DYNAMODB_POSTS_TABLE || "PlacifyPosts",
  COMMENTS: process.env.DYNAMODB_COMMENTS_TABLE || "PlacifyComments",
  RESUMES: process.env.DYNAMODB_RESUMES_TABLE || "PlacifyResumes",
  MESSAGES: process.env.DYNAMODB_MESSAGES_TABLE || "PlacifyMessages",
  CONVERSATIONS: process.env.DYNAMODB_CONVERSATIONS_TABLE || "PlacifyConversations",
};

// Health check function
const checkDynamoDBConnection = async () => {
  try {
    await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { userId: "test-health-check" },
    }));
    console.log("✓ DynamoDB connection successful");
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      console.error("✗ DynamoDB table not found:", TABLES.USERS);
    } else {
      console.error("✗ DynamoDB connection failed:", error.message);
    }
    return false;
  }
};

module.exports = {
  dynamoDBClient,
  docClient,
  TABLES,
  checkDynamoDBConnection,
};
