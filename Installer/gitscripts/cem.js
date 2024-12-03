// const https = require('https');
// const { execSync } = require('child_process');

// const userEmail = execSync('git config user.email').toString().trim();

// https.get('https://gitops-production.up.railway.app/api/emails', (res) => {
//     let data = '';
//     res.on('data', chunk => data += chunk);
//     res.on('end', () => {
//         const { approved } = JSON.parse(data);
//         if (approved.includes(userEmail)) {
//             console.log('✅ Email verified:', userEmail);
//             process.exit(0);
//         } else {
//             console.log(userEmail,'❌ This email banned from commiting due to delayed activity please contact admin to unblock.');
//             process.exit(1);
//         }
//     });
// }).on('error', err => {
//     console.log('Error:', err.message);
//     process.exit(1);
// });

const https = require('https');
const { execSync } = require('child_process');

// Function to calculate the number of weekdays (Mon-Fri) between two dates
function countWeekdays(startDate, endDate) {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
        const day = currentDate.getDay(); // Get the day of the week (0 - Sunday, 6 - Saturday)
        if (day !== 0 && day !== 6) { // Skip weekends
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return count;
}

// Get the user's email from git config
const userEmail = execSync('git config user.email').toString().trim();

// Fetch the last commit date
const lastCommitDate = execSync('git log -1 --format=%cd').toString().trim();

// Convert the commit date to a Date object
const lastCommitDateObj = new Date(lastCommitDate);

// Get today's date
const today = new Date();

// Calculate the weekdays between the last commit and today
const daysBetween = countWeekdays(lastCommitDateObj, today);

// Show a terminal popup message (in this case, just log it to the terminal)
console.log(`⏳ Days since the previous commit: ${daysBetween} weekdays.`);

// If more than 3 weekdays have passed, ban the user
if (daysBetween > 3) {
    console.log(`❌ You have taken more than 3 weekdays to commit. Your email is now banned.`);
    
    // Call the API to ban the user
    const banUrl = `https://gitops-production.up.railway.app/api/move?to=banned&email=${userEmail}`;
    
    https.get(banUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('User banned:', userEmail);
            process.exit(1);
        });
    }).on('error', err => {
        console.log('Error:', err.message);
        process.exit(1);
    });
} else {
    // If the commit was within the allowed time, proceed with the commit
    https.get('https://gitops-production.up.railway.app/api/emails', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const { approved } = JSON.parse(data);
            if (approved.includes(userEmail)) {
                console.log('✅ Email verified:', userEmail);
                process.exit(0);
            } else {
                console.log(`${userEmail} ❌ This email is banned from committing due to delayed activity. Please contact admin to unblock.`);
                process.exit(1);
            }
        });
    }).on('error', err => {
        console.log('Error:', err.message);
        process.exit(1);
    });
}
