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

app.post(
  "/aiserver2/v1/chat/completions",
  authenticateRequest,
  async (req, res) => {
    const sessionId =
      req.body?.sessionId || Math.random().toString(36).substring(7);
    const session = await getOrCreateSession(sessionId);

    // Extract the XML-based environment data from the request
    const xmlData = req.body.environmentDetails || "";
    let parsedEnvironment;

    // Parse the XML data
    try {
      parsedEnvironment = await new Promise((resolve, reject) => {
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

    // Extract the VSCode environment details from parsed XML
    const fileList =
      parsedEnvironment.environment_details?.[0]?.file_list?.[0]?.filename ||
      [];
    const openTabs =
      parsedEnvironment.environment_details?.[0]?.open_tabs?.[0]?.tab || [];

    // Generate an agentic prompt based on environment details
    const agenticPrompt = `
    You are a highly capable coding assistant with the ability to analyze the context of files in a VSCode environment and take actions accordingly.
    Here is the environment you're working in:

    - Files in the workspace: ${fileList.join(", ")}
    - Open tabs: ${openTabs.join(", ")}

    Based on this environment, analyze the content of the files, suggest improvements, or respond to the user based on the context. If any changes are needed to a file, provide a snippet of the updated code in XML format, or provide explanations in XML.

    Last task: Respond intelligently to the user's needs, considering the current files and open tabs. Be sure to consider relevant files like index.js, test.js, and generalAi.js.
    
    <user_message>
      ${req.body.messages?.[req.body.messages.length - 1]?.content || ""}
    </user_message>

    Please provide your response in the following XML format:
    <response>
      <action>Action to perform</action>
      <details>Details of your action or suggestion</details>
      <code_snippet>Suggested code or explanation</code_snippet>
    </response>
  `;

    // Interact with the model (Mistral 7B or similar) using the generated agentic prompt
    try {
      const iterator = await session.client.submit("/chat", [
        agenticPrompt, // The environment-aware agentic prompt
        session.history, // Previous session context
        0.9, // Temperature for creative responses
        4096, // Max tokens for response
        0.95, // Top-p for nucleus sampling
        1.2, // Frequency penalty to avoid repetition
      ]);

      let finalResponse = "";
      for await (const chunk of iterator) {
        if (chunk.data && chunk.data[0]) {
          finalResponse = chunk.data[0].replace("</s>", "").trim();
        }
      }

      // Add to session history for future context
      session.history.push([
        req.body.messages?.[req.body.messages.length - 1]?.content,
        finalResponse,
      ]);

      // Return response to the client in OpenAI-like format (or your desired format)
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
              content: finalResponse, // Return the generated response (XML-based)
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens:
            req.body.messages?.[req.body.messages.length - 1]?.content.length ||
            0,
          completion_tokens: finalResponse.length,
          total_tokens:
            (req.body.messages?.[req.body.messages.length - 1]?.content
              .length || 0) + finalResponse.length,
        },
      });
    } catch (error) {
      // Error handling
      res
        .status(500)
        .json({ error: "Internal Server Error", message: error.message });
    }
  }
);


app.listen(3000, () => console.log("HTTP Server running on port 3000"));

