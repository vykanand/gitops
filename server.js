// import express from "express";
// import { Client } from "@gradio/client";
// import cors from "cors"; // Importing cors

// const app = express();
// app.use(express.json());

// // Enable CORS for all routes
// app.use(cors());  // This allows all domains to access the API

// // Session storage
// const sessions = new Map();

// async function getOrCreateSession(sessionId) {
//   let session = sessions.get(sessionId);

//   if (!session) {
//     const client = await Client.connect("Clone04/mistral-7b-v0.3-chatbpt");
//     // const client = await Client.connect("huggingface-projects/gemma-2-9b-it");
//     session = {
//       client,
//       history: [],
//       lastAccessed: Date.now(),
//     };
//     sessions.set(sessionId, session);
//   }

//   session.lastAccessed = Date.now();
//   return session;
// }

// app.post("/aiserver", async (req, res) => {
//   const sessionId =
//     req.body?.sessionId || Math.random().toString(36).substring(7);
//   const session = await getOrCreateSession(sessionId);

//   const iterator = await session.client.submit("/chat", [
//     req.body.aiquestion,
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

//   session.history.push([req.body.aiquestion, finalResponse]);

//   res.json({
//     response: finalResponse,
//     sessionId: sessionId,
//   });
// });

// // Add at the top of the file with other imports
// const authenticateRequest = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const apiKey = "sk-test-123456789"; // Hardcoded API key for testing
  
//   // if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
//   //   return res.status(401).json({ error: "Unauthorized" });
//   // }
//   next();
// }

// // Updated endpoint with authentication
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

// app.listen(3000, () => console.log("HTTP Server running on port 3000"));












import express from "express";
import { Client } from "@gradio/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const sessions = new Map();

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers["authorization"]?.split(" ")[1];
  if (!apiKey || apiKey !== "your-secret-api-key") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

async function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);

  if (!session) {
    const client = await Client.connect(
      "wewqeadfdhd/deepseek-ai-DeepSeek-R1-Distill-Qwen-1.5B"
    );
    session = {
      client,
      history: [],
      lastAccessed: Date.now(),
    };
    sessions.set(sessionId, session);
  }
  return session;
}

app.post("/aiserver", async (req, res) => {
  try {
    const sessionId =
      req.body?.sessionId || Math.random().toString(36).substring(7);
    const session = await getOrCreateSession(sessionId);

    const result = await session.client.predict("/chat", [
      req.body.aiquestion,
      0.5,
      1024,
    ]);

    let finalResponse = "";
    if (Array.isArray(result.data) && result.data.length > 0) {
      finalResponse = result.data[0];
    } else {
      finalResponse = result.data.toString();
    }

    session.history.push([req.body.aiquestion, finalResponse]);

    res.json({
      response: finalResponse,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Chat processing error:", error);
    res.status(500).json({
      error: "Chat processing failed",
      details: error.message,
    });
  }
});

app.post("/aiserver2/v1/chat/completions", async (req, res) => {
  try {
    const sessionId =
      req.body?.sessionId || Math.random().toString(36).substring(7);
    const session = await getOrCreateSession(sessionId);

    // Define lastMessage from the request body
    const lastMessage = req.body.aiquestion;

    const result = await session.client.predict("/chat", [lastMessage]);

    let finalResponse = "";
    if (Array.isArray(result.data) && result.data.length > 0) {
      finalResponse = result.data[0];
    } else {
      finalResponse = result.data.toString();
    }

    session.history.push([lastMessage, finalResponse]);

    res.json({
      id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "olm",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: finalResponse,
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: countTokens(lastMessage),
        completion_tokens: countTokens(finalResponse),
        total_tokens: countTokens(lastMessage) + countTokens(finalResponse),
      },
    });
  } catch (error) {
    console.error("Chat completions error:", error);
    res.status(500).json({
      error: "Chat completions failed",
      details: error.message,
    });
  }
});

// Helper function to count tokens (simplified)
function countTokens(text) {
  const spaces = 4; // Number of spaces in a token separator
  const totalChars = text.length;
  const totalSpaces = (text.match(/ /g) || []).length;
  return Math.ceil((totalChars - totalSpaces) / spaces) + totalSpaces;
}

app.listen(3000, () => console.log("HTTP Server running on port 3000"));