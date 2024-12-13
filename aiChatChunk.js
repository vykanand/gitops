const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKeys = [
  "AIzaSyDgeZ-JVfUuVouEoDv_FxlPfCuxz6LeVyw",
  "AIzaSyDuMVRujmPygn0g1QxI-a8CUEZ9gu-Q778",
  "AIzaSyCprWxBmsoxPDcA0OTsYGOOtYVd_51J5po",
  "AIzaSyD-yA6Mg6tLYaRLFwmfis2g41-ONx-lSzc",
];

let currentApiKeyIndex = 0;

// Get the next API key in rotation
const getNextApiKey = () => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentApiKeyIndex];
};

// Function to send a question to Gemini AI
const askQuestion = async (question) => {
  let apiKey = getNextApiKey();
  let retries = apiKeys.length; // Try each key once before failing

  console.log("Starting to process the question...");

  while (retries > 0) {
    try {
      console.log(`Using API key: ${apiKey}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log("AI model initialized.");

      const chat = model.startChat();
      console.log("Chat session started.");

      console.log("Sending question to AI...");
      const result = await chat.sendMessage(question);
      console.log("Question sent.");

      console.log("Waiting for AI response...");
      const responseText = await result.response.text();
      console.log("Received response.");

      return responseText.trim();
    } catch (error) {
      console.error(`Error with API key ${apiKey}: ${error.message}`);
      retries--;
      if (retries > 0) {
        console.log("Retrying with next API key...");
        apiKey = getNextApiKey(); // Rotate to next API key
      } else {
        throw new Error("All API keys have been tried and failed.");
      }
    }
  }
};

// Function to chunk text into manageable sizes
const chunkText = (text, chunkSize) => {
  console.log("Chunking text...");
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  console.log("Text chunked into", chunks.length, "chunks.");
  return chunks;
};

// Process all text chunks and combine responses
const processChunks = async (chunks) => {
  console.log("Processing chunks...");
  let combinedResponse = "";
  const totalChunks = chunks.length;

  for (const [index, chunk] of chunks.entries()) {
    console.log(`Processing chunk ${index + 1} of ${totalChunks}...`);
    try {
      const response = await askQuestion(chunk);
      combinedResponse += response + " "; // Combine responses

      // Calculate and log the percentage completed
      const percentageCompleted = ((index + 1) / totalChunks) * 100;
      console.log(`Progress: ${percentageCompleted.toFixed(2)}% completed.`);
    } catch (error) {
      console.error(`Error processing chunk ${index + 1}: ${error.message}`);
    }
  }
  console.log("All chunks processed.");
  return combinedResponse.trim();
};

// Main function to process long text using AI (no HTML stripping)
const aiProcessor = async (content) => {
  console.log("Starting AI processing...");

  // Use the content directly without HTML conversion
  console.log("Processing plain text content...");
  const plainText = content.trim(); // Ensure there are no leading/trailing spaces
  console.log("Content is plain text.");

  // Set chunk size based on known token limit
  const tokenLimit = 20000; // Example token limit
  const chunkSize = Math.floor(tokenLimit * 0.95); // Use 95% of token limit for safety
  console.log(`Chunking text into chunks of size ${chunkSize}...`);
  const chunks = chunkText(plainText, chunkSize);

  console.log("Processing chunks...");
  const finalResponse = await processChunks(chunks);

  console.log("AI processing completed! Check the results!");
  return finalResponse;
};

// Export aiProcessor function for use in other files
module.exports = { aiProcessor };
