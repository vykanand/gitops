const inquirer = require('inquirer');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const aichat = require('./generalAI');

// Function to list all branches in the selected Git repository
async function listBranches(repoPath) {
  const git = simpleGit(repoPath);
  try {
    const branches = await git.branch();
    return branches.all;
  } catch (error) {
    console.error('Error fetching branches:', error.message);
    return [];
  }
}

// Function to compare two branches and show the diff
async function compareBranches(repoPath, branch1, branch2) {
  const git = simpleGit(repoPath);
  try {
    // Get the diff between two branches in Git
    const diff = await git.diff([`${branch1}..${branch2}`]);

    if (!diff) {
      console.log('No differences found between the branches.');
      return '';
    }

    // Output the diff in the standard Git format (return it instead of logging)
    return `\nComparing ${branch1} and ${branch2}:\n${diff}`;
  } catch (error) {
    console.error('Error fetching diff:', error.message);
    return '';
  }
}

// Main function to interact with the user
async function main() {
  // Prompt user to select a local folder
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoPath',
      message: 'Enter the path of the local Git repository:',
      validate: (input) => {
        if (fs.existsSync(input) && fs.lstatSync(input).isDirectory()) {
          const gitDir = path.join(input, '.git');
          if (fs.existsSync(gitDir)) {
            return true;
          }
        }
        return 'Please provide a valid path to a Git repository.';
      }
    }
  ]);
  

  const repoPath = answers.repoPath;

  // Get list of branches in the selected repo
  const branches = await listBranches(repoPath);
  if (branches.length === 0) {
    console.log('No branches found in this repository.');
    return;
  }

  // Prompt user to select two branches to compare
  const branchSelection = await inquirer.prompt([
    {
      type: 'list',
      name: 'branch1',
      message: 'Select the first branch to compare:',
      choices: branches,
    },
    {
      type: 'list',
      name: 'branch2',
      message: 'Select the second branch to compare:',
      choices: branches,
    }
  ]);

  const { branch1, branch2 } = branchSelection;

  // Set the initial part of the code review guidelines
  let codeChanges = `
  =============
  Please do code review this code and following these guidelines:
  
  1. Best coding standards and practices.
  2. No code smells (e.g., inefficient, redundant, or poor code design).
  3. Proper file conventions (e.g., naming conventions, structure, and organization of files).
  4. No security vulnerabilities (e.g., SQL injection, cross-site scripting, or other attacks).
  5. No performance issues (e.g., slow response times, excessive memory usage, or other bottlenecks).
  6. No bugs or errors (e.g., crashes, incorrect results, or unexpected behavior).
  8. No code duplication.
  10. No code comments (e.g., inline comments, block comments, or documentation comments).
  11. No code formatting issues (e.g., inconsistent indentation, line length, or whitespace).
  
  Provide feedback on any issues or suggestions for improvement based on the above points.
  
  Give code suggestions to improve the code quality, along with the filename, line number, and line of code.
  `;

  // Get the diff between the branches and append it to the code review guidelines
  const branchDiff = await compareBranches(repoPath, branch1, branch2);
  codeChanges += branchDiff;

  // Send the generated code review content to the AI model
  const response = await aichat.askQuestion(codeChanges);

  // Log the AI's response (feedback and suggestions)
  console.log('\nAI Code Review Response:\n');
  console.log(response);
}

main();
