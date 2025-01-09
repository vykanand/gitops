import express from "express";
import { Client } from "@gradio/client";

const app = express();
app.use(express.json());

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
    // console.log(`Processing chunk: ${chunk.data[0]}`);
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

app.listen(3000, () => console.log("HTTP Server running on port 3000"));
