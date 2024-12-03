// Import necessary libraries
const simpleGit = require('simple-git');
const path = require('path');
const aichat = require('./generalAI');

// Define the path to the desired repository
let selectedRepoPath = path.join(__dirname, '../darpan2/darpan-frontend-web'); // Path to the Git repo

// Initialize simple-git with the selected repo path
const git = simpleGit(selectedRepoPath);

// Function to get the current status of the Git repository
async function getRepoStatus() {
    try {
        // Fetch the current status of the repository (modified, created, deleted files)
        const status = await git.status();

        // console.log('Repository Status:');
        // console.log(status);

        // Return changed files: modified, created, and deleted files
        return status.modified.concat(status.created, status.deleted);
    } catch (error) {
        console.error('Error while checking repo status:', error);
        return [];
    }
}

// Function to get the diff of changed files
async function getDiffs(files) {
    let diffs = {};

    // Fetch the diffs for each changed file in Git diff format
    for (const file of files) {
        try {
            // If the file is deleted, skip diff fetching and add a special message
            const status = await git.status();
            if (status.deleted.includes(file)) {
                diffs[file] = `File ${file} has been deleted. No diff available.`;
            } else {
                const diff = await git.diff([file]);
                diffs[file] = diff;
            }
        } catch (error) {
            console.error(`Error fetching diff for file ${file}:`, error);
        }
    }

    return diffs;
}

// Function to fetch the file contents (both current and staged) for full analysis
async function getFileContents(files) {
    let fileContents = {};

    for (const file of files) {
        try {
            // Fetch the current (original) file content from HEAD
            const currentFile = await git.show([`HEAD:${file}`]); // Original content from the last commit
            // Fetch the staged file content (if any changes are staged)
            const stagedFile = await git.show([`:${file}`]); // Staged content

            fileContents[file] = {
                original: currentFile,
                incoming: stagedFile
            };
        } catch (error) {
            console.error(`Error fetching file contents for ${file}:`, error);
        }
    }

    return fileContents;
}

// Function to format the diffs and file contents for LLM analysis
function formatChangesForLLM(fileContents, diffs) {
    let formattedChanges = 'The following code changes were detected:\n\n';

    for (const [file, diff] of Object.entries(diffs)) {
        formattedChanges += `File: ${file}\n`;

        // Add original and incoming contents
        if (fileContents[file]) {
            formattedChanges += `Original Content:\n${fileContents[file].original}\n\n`;
            formattedChanges += `Incoming Content:\n${fileContents[file].incoming}\n\n`;
        }

        if (diff.startsWith('File')) {
            // Special message for deleted files
            formattedChanges += `Status: Deleted\nNo diff available for deleted file.\n\n`;
        } else {
            // Add diff details for modified files
            const diffLines = diff.split('\n');

            for (const line of diffLines) {
                if (line.startsWith('-')) {
                    formattedChanges += `Removed: ${line.slice(1)}\n`;  // Lines removed
                } else if (line.startsWith('+')) {
                    formattedChanges += `Added: ${line.slice(1)}\n`;  // Lines added
                }
            }

            formattedChanges += '\n=====================================\n\n';
        }
    }

    // Append the analysis prompt for the LLM model
    formattedChanges += `
Please do code review of the incoming changes in the code and follow the below guidelines:

1. Best coding standards and practices.
2. No code smells (e.g., inefficient, redundant, or poor code design).
3. Proper file conventions (e.g., naming conventions, structure, and organization of files)
4. No security vulnerabilities (e.g., SQL injection, cross-site scripting, or other attacks).
5. No performance issues (e.g., slow response times, excessive memory usage, or other bottlenecks).
6. No bugs or errors (e.g., crashes, incorrect results, or unexpected behavior).
8. No code duplication.
10. No code comments (e.g., inline comments, block comments, or documentation comments).
11. No code formatting issues (e.g., inconsistent indentation, line length, or whitespace).

Provide feedback on any issues or suggestions for improvement based on the above points.

give code suggestions to improve the code quality. along with filename with line number and line of code.
`;

    return formattedChanges;
}

// Function to analyze and display the changes
async function analyzeChanges() {
    // Get the list of changed files
    const changedFiles = await getRepoStatus();

    if (changedFiles.length === 0) {
        console.log('No changes detected.');
        return;
    }

    console.log('Changed Files:', changedFiles);

    // Get the diffs for the changed files in Git diff format
    const diffs = await getDiffs(changedFiles);

    // Fetch the contents of the changed files (both original and incoming)
    const fileContents = await getFileContents(changedFiles);

    // Format and display the diffs in a way that is ready for LLM analysis
    const formattedChanges = formatChangesForLLM(fileContents, diffs);
    console.log('Formatted Changes for LLM Analysis:');
    // console.log(formattedChanges);

    const response = await aichat.chunkedAI(formattedChanges);
    console.log(response);
}

// Run the analysis
analyzeChanges();
