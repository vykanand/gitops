import express from "express";
import { Client } from "@gradio/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const apiKey = "sk-test-123456789"; // API key for testing
  next();
};

async function initializeModel() {
  try {
    const client = await Client.connect("Clone04/mistral-7b-v0.3-chatbpt");
    console.log("Model loaded successfully!");
    return client;
  } catch (error) {
    console.error("Failed to load model:", error);
    process.exit(1);
  }
}

async function startServer() {
  const defaultClient = await initializeModel();

  const sessions = new Map();

  async function getOrCreateSession(sessionId) {
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        client: defaultClient,
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

  app.post(
    "/aiserver2/v1/chat/completions",
    authenticateRequest,
    async (req, res) => {
      const sessionId =
        req.body?.sessionId || Math.random().toString(36).substring(7);
      const session = await getOrCreateSession(sessionId);
      const messages = req.body.messages || [];
      const lastMessage = messages[messages.length - 1]?.content || "";

      const iterator = await session.client.submit("/chat", [
        lastMessage,
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

      session.history.push([lastMessage, finalResponse]);

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
              content: finalResponse,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: lastMessage.length,
          completion_tokens: finalResponse.length,
          total_tokens: lastMessage.length + finalResponse.length,
        },
      });
    }
  );

  app.listen(3000, () => {
    console.log("Model loaded and HTTP Server running on port 3000");
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
