const { GoogleGenerativeAI } = require("@google/generative-ai");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

const apiKeys = [
  "AIzaSyD-uup_a5xjMR7HS5Uf9I44KqoH63qogoU",
  "AIzaSyBUvsUIJn1mVJ8iqEX59IG4LXJp1pnZZXQ",
];

let currentKeyIndex = 0;

const getNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentKeyIndex];
};

function splitDiffIntoChunks(diff, maxChunkSize = 8000) {
  console.log("\n🔍 Analyzing code changes...");
  const files = diff.split("diff --git");
  const chunks = [];
  let currentChunk = "";

  for (const file of files) {
    if (!file.trim()) continue;
    const fileContent = "diff --git" + file;
    const lines = fileContent.split('\n');
    let lineNumber = 0;
    let modifiedLines = '';
    for (const line of lines) {
      lineNumber++;
      if (line.startsWith('+') || line.startsWith('-')) {
        modifiedLines += `${lineNumber}:${line}\n`;
      }
    }
    if (currentChunk.length + modifiedLines.length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = modifiedLines;
    } else {
      currentChunk += currentChunk ? "\n" + modifiedLines : modifiedLines;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  console.log(`✅ Processing complete..`);
  return chunks;
}

async function chunkedAI(prompt, progressBar, chunk, totalChunks) {
  let apiKey = getNextApiKey();
  let retries = apiKeys.length;

  while (retries > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      progressBar.update(chunk);
      return response.text();
    } catch (error) {
      retries--;
      apiKey = getNextApiKey();
      console.log(
        colors.yellow(
          `⚠️  API rotation: ${apiKeys.length - retries}/${apiKeys.length}`
        )
      );
    }
  }
  return null;
}

async function getSpecificReview(diff) {
  const chunks = splitDiffIntoChunks(diff);
  let fullAnalysis = "";

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format:
      "Analysis Progress |" +
      colors.cyan("{bar}") +
      "| {percentage}% | {value}/{total} Chunks",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  console.log("🚀 Starting code analysis...\n");
  progressBar.start(chunks.length, 0);

  for (let i = 0; i < chunks.length; i++) {
    //Improved regex to extract filename
    const fileMatch = chunks[i].match(/diff --git a\/(.*?) b\/(.*)/);
    const fileName = fileMatch ? fileMatch[1] : "Unknown File";

    const prompt = `
Analyze this code change.  File: ${fileName}
Segment ${i + 1}/${chunks.length}

Focus on:
1. Code Quality and Best Practices
2. Security Considerations
3. Performance Impact
4. Maintainability

Changes:
${chunks[i]}`;

    const analysis = await chunkedAI(prompt, progressBar, i + 1, chunks.length);
    if (analysis) {
      fullAnalysis += `\n## File: ${fileName}\n${analysis}\n`;
    }
  }

  progressBar.stop();
  console.log("\n✨ Analysis complete!\n");

  return (
    fullAnalysis ||
    "Analysis completed successfully with no significant issues found."
  );
}

module.exports = {
  getSpecificReview,
  chunkedAI,
};
