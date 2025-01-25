import express from "express";
import { Client } from "@gradio/client";
import cors from "cors"; // Importing cors

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());  // This allows all domains to access the API

// Session storage
const sessions = new Map();

async function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);

  if (!session) {
    const client = await Client.connect("Clone04/mistral-7b-v0.3-chatbpt");
    session = {
      client,
      history: [],
      lastAccessed: Date.now(),
    };
    sessions.set(sessionId, session);
  }

  session.lastAccessed = Date.now();
  return session;
}

app.post("/aiserver", async (req, res) => {
  const sessionId =
    req.body?.sessionId || Math.random().toString(36).substring(7);
  const session = await getOrCreateSession(sessionId);

  const iterator = await session.client.submit("/chat", [
    req.body.aiquestion,
    session.history,
    0.9,
    4096,
    0.95,
    1.2,
  ]);

  let finalResponse = "";
  for await (const chunk of iterator) {
    if (chunk.data && chunk.data[0]) {
      finalResponse = chunk.data[0].replace("</s>", "").trim();
    }
  }

  session.history.push([req.body.aiquestion, finalResponse]);

  res.json({
    response: finalResponse,
    sessionId: sessionId,
  });
});





// Add at the top of the file with other imports
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = "sk-test-123456789"; // Hardcoded API key for testing
  
  // if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }
  next();
}

// Updated endpoint with authentication
// app.post("/aiserver2/v1/chat/completions", authenticateRequest, async (req, res) => {
//   const sessionId = req.body?.sessionId || Math.random().toString(36).substring(7);
//   const session = await getOrCreateSession(sessionId);

//   // Extract message from OpenAI-style request body
//   const messages = req.body.messages || [];
//   const lastMessage = messages[messages.length - 1]?.content || "";

//   const iterator = await session.client.submit("/chat", [
//     lastMessage,
//     session.history,
//     0.9,
//     4096,
//     0.95,
//     1.2,
//   ]);

//   let finalResponse = "";
//   for await (const chunk of iterator) {
//     if (chunk.data && chunk.data[0]) {
//       finalResponse = chunk.data[0].replace("</s>", "").trim();
//     }
//   }

//   session.history.push([lastMessage, finalResponse]);

//   res.json({
//     id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
//     object: "chat.completion",
//     created: Math.floor(Date.now() / 1000),
//     model: "mistral-7b-v0.3",
//     choices: [
//       {
//         index: 0,
//         message: {
//           role: "assistant",
//           content: finalResponse
//         },
//         finish_reason: "stop"
//       }
//     ],
//     usage: {
//       prompt_tokens: lastMessage.length,
//       completion_tokens: finalResponse.length,
//       total_tokens: lastMessage.length + finalResponse.length
//     }
//   });
// });


const xml2js = require("xml2js"); // XML parsing library

const xml2js = require("xml2js");

app.post(
  "/aiserver2/v1/coding_agent",
  authenticateRequest,
  async (req, res) => {
    const sessionId =
      req.body?.sessionId || Math.random().toString(36).substring(7);
    const session = await getOrCreateSession(sessionId);

    // Parse the XML-based coding task from the request
    const xmlData = req.body.codingAgentTask || "";
    let parsedTask;

    try {
      parsedTask = await new Promise((resolve, reject) => {
        xml2js.parseString(xmlData, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Invalid XML format", message: error.message });
    }

    // Extract task, code, and context from the parsed XML
    const taskDescription = parsedTask.coding_agent?.[0]?.task?.[0] || "";
    const codeSnippet = parsedTask.coding_agent?.[0]?.code?.[0] || "";
    const context = parsedTask.coding_agent?.[0]?.context?.[0] || "";

    // Generate the agentic prompt
    const agenticPrompt = `
    You are a coding agent. Your task is to analyze the provided code and task description, and return actionable suggestions in XML format.

    Task: ${taskDescription}
    Code: ${codeSnippet}
    Context: ${context}

    Please respond in XML with:
    - <action>: The main task or recommendation.
    - <suggestion>: The suggested code snippet.
    - <reasoning>: Explanation of why the change was made.
    `;

    // Submit prompt to the model
    try {
      const iterator = await session.client.submit("/chat", [
        agenticPrompt, // The task description and instructions for the agent
        session.history, // Previous context/history
        0.9, // Temperature
        4096, // Max tokens
        0.95, // Top-p
        1.2, // Frequency penalty
      ]);

      let finalResponse = "";
      for await (const chunk of iterator) {
        if (chunk.data && chunk.data[0]) {
          finalResponse = chunk.data[0].replace("</s>", "").trim();
        }
      }

      session.history.push([req.body.codingAgentTask, finalResponse]);

      // Return the response in XML format
      res.json({
        id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "mistral-7b-v0.3",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: finalResponse, // Return the agent's structured response
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: req.body.codingAgentTask.length,
          completion_tokens: finalResponse.length,
          total_tokens: req.body.codingAgentTask.length + finalResponse.length,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  }
);



app.listen(3000, () => console.log("HTTP Server running on port 3000"));

