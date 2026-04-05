const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const getEnv = (name, fallback = "") => {
  const value = process.env[name];
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const dynamoClientConfig = {
  region: getEnv("AWS_REGION", "ap-south-1"),
};

const accessKeyId = getEnv("AWS_ACCESS_KEY_ID", "");
const secretAccessKey = getEnv("AWS_SECRET_ACCESS_KEY", "");
const sessionToken = getEnv("AWS_SESSION_TOKEN", "");

if (accessKeyId && secretAccessKey) {
  dynamoClientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {}),
  };
}

// Initialize DynamoDB Client
const dynamoDBClient = new DynamoDBClient(dynamoClientConfig);

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
  USERS: getEnv("DYNAMODB_USERS_TABLE", "PlacifyUsers"),
  POSTS: getEnv("DYNAMODB_POSTS_TABLE", "PlacifyPosts"),
  COMMENTS: getEnv("DYNAMODB_COMMENTS_TABLE", "PlacifyComments"),
  RESUMES: getEnv("DYNAMODB_RESUMES_TABLE", "PlacifyResumes"),
  MESSAGES: getEnv("DYNAMODB_MESSAGES_TABLE", "PlacifyMessages"),
  CONVERSATIONS: getEnv("DYNAMODB_CONVERSATIONS_TABLE", "PlacifyConversations"),
  INTERVIEWIQ_QUESTIONS: getEnv("DYNAMODB_INTERVIEWIQ_QUESTIONS_TABLE", "InterviewIQ_Questions"),
  INTERVIEWIQ_DECKS: getEnv("DYNAMODB_INTERVIEWIQ_DECKS_TABLE", "InterviewIQ_Decks"),
  INTERVIEWIQ_RESPONSES: getEnv("DYNAMODB_INTERVIEWIQ_RESPONSES_TABLE", "InterviewIQ_Responses"),
  INTERVIEWIQ_USER_PROGRESS: getEnv("DYNAMODB_INTERVIEWIQ_USER_PROGRESS_TABLE", "InterviewIQ_UserProgress"),
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
