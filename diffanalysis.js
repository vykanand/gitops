const inquirer = require("inquirer");
const simpleGit = require("simple-git");
const aichat = require("./generalAI");

async function listBranches(repoPath) {
  const git = simpleGit(repoPath);
  try {
    const branches = await git.branch();
    return branches.all;
  } catch (error) {
    console.log("Branch listing error:", error.message);
    return [];
  }
}

async function compareBranches(repoPath, branch1, branch2) {
  const git = simpleGit(repoPath);
  try {
    const diff = await git.diff([`${branch1}..${branch2}`]);
    return diff ? diff : "";
  } catch (error) {
    console.log("Diff comparison error:", error.message);
    return "";
  }
}

async function generateAnalysis(diff) {
  console.log("\nGenerating comprehensive code analysis...");
  const analysis = await aichat.getSpecificReview(diff);
  console.log("\n=== Code Analysis Report ===\n");
  console.log(analysis);
  return analysis;
}

async function main() {
  try {
    const { repoPath } = await inquirer.prompt([
      {
        type: "input",
        name: "repoPath",
        message: "Git repository path:",
        default: process.cwd(),
        validate: (input) =>
          require("fs").existsSync(require("path").join(input, ".git")),
      },
    ]);

    const branches = await listBranches(repoPath);
    if (!branches.length) {
      console.log("No branches found");
      return;
    }

    const { branch1, branch2 } = await inquirer.prompt([
      {
        type: "list",
        name: "branch1",
        message: "Select first branch:",
        choices: branches,
      },
      {
        type: "list",
        name: "branch2",
        message: "Select second branch:",
        choices: branches,
      },
    ]);

    const diff = await compareBranches(repoPath, branch1, branch2);
    if (!diff) {
      console.log("No differences found between branches");
      return;
    }

    await generateAnalysis(diff);
  } catch (error) {
    console.log("Operation failed:", error.message);
  }
}

main();
