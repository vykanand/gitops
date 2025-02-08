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



async function getOrCreateSession(sessionId) {
  let session = sessions.get(sessionId);
  if (!session) {
  //llamameta/Google-Gemini-Pro-2-latest-2025
    const client = await Client.connect(
      "vykanand/DeepSeek-R1-Distill-Qwen-1.5B-Demo-GGUF"
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
  const sessionId =
    req.body?.sessionId || Math.random().toString(36).substring(7);
  const session = await getOrCreateSession(sessionId);

  try {
    const result = await session.client.predict("/chat", [
      req.body.aiquestion, // message
      "You are a pro coding programmer", // system_message
      18000, // max_tokens
      0.7, // temperature_qwen
      0.95, // top_p_qwen
    ]);

    session.history.push([req.body.aiquestion, result.data]);

    res.json({
      response: result.data,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error("Chat processing:", error);
    res.status(500).json({
      error: "Chat processing failed",
      details: error.message,
    });
  }
});

// New chat completion endpoint with Ollama
// Chat completion endpoint
app.post("/chat", async (req, res) => {
  const sessionId = req.body?.sessionId || Math.random().toString(36).substring(7);
  const session = await getOrCreateSession(sessionId);

  try {
    const result = await session.client.predict("/chat", [
      req.body.message,
      "You are a pro coding programmer",
      18000,
      0.7,
      0.95,
    ]);

    session.history.push([req.body.message, result.data]);
    session.lastAccessed = Date.now();

    res.json({
      response: result.data,
      sessionId: sessionId,
      history: session.history
    });
  } catch (error) {
    console.error("Chat completion error:", error);
    res.status(500).json({
      error: "Chat completion failed",
      details: error.message
    });
  }
});

// ChatGPT-style v1/completions endpoint
app.post("/v1/completions", async (req, res) => {
  const session = await getOrCreateSession(req.body?.sessionId);
  
  try {
    const result = await session.client.predict("/chat", [
      req.body.prompt || req.body.messages?.[0]?.content,
      req.body.system_message || "You are a pro coding programmer",
      req.body.max_tokens || 18000,
      req.body.temperature || 0.7,
      req.body.top_p || 0.95,
    ]);

    const response = {
      id: `cmpl-${Date.now()}`,
      object: "text_completion",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-pro",
      choices: [
        {
          text: result.data,
          index: 0,
          logprobs: null,
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: req.body.prompt?.length || 0,
        completion_tokens: result.data.length,
        total_tokens: (req.body.prompt?.length || 0) + result.data.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Completion error:", error);
    res.status(500).json({
      error: {
        message: "Completion failed",
        type: "server_error",
        code: 500
      }
    });
  }
});

// ChatGPT-style v1/chat/completions endpoint
app.post("/v1/chat/completions", async (req, res) => {
  const session = await getOrCreateSession(req.body?.sessionId);

  try {
    const messages = req.body.messages;
    const systemPrompt =
      messages.find((m) => m.role === "system")?.content ||
      "You are a pro coding programmer";
    const lastMessage = messages[messages.length - 1];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const result = await session.client.predict("/chat", [
      lastMessage.content,
      systemPrompt,
      18000,
      0.7,
      0.95,
    ]);

    // Send the content chunk
    const data = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-pro",
      choices: [
        {
          index: 0,
          delta: {
            content: result.data,
          },
          finish_reason: null,
        },
      ],
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    // Send the final chunk
    const finalData = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      model: "gemini-pro",
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: "stop",
        },
      ],
    };
    res.write(`data: ${JSON.stringify(finalData)}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();

    session.history.push([lastMessage.content, result.data]);
    session.lastAccessed = Date.now();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          message: "Chat completion failed",
          type: "server_error",
          code: 500,
          details: error.message,
        },
      });
    }
  }
});


// Model info endpoint
app.get("/v1/models", (req, res) => {
  res.json({
    data: [
      {
        id: "gemini-pro",
        object: "model",
        created: Date.now(),
        owned_by: "google",
        permission: [],
        root: "gemini-pro",
        parent: null,
      },
    ],
  });
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));


