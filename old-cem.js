#!/usr/bin/env node

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

    // Reset the time to 00:00:00 to avoid issues with time comparison
    currentDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
        const day = currentDate.getDay(); // Get the day of the week (0 - Sunday, 6 - Saturday)
        if (day !== 0 && day !== 6) { // Skip weekends (0 = Sunday, 6 = Saturday)
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
            process.exit(1);  // Exit with a non-zero status to prevent commit
        });
    }).on('error', err => {
        console.log('Error:', err.message);
        process.exit(1);  // Exit with a non-zero status to prevent commit
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
                process.exit(0);  // Allow the commit to proceed
            } else {
                console.log(`${userEmail} ❌ This email is banned from committing due to delayed activity. Please contact admin to unblock.`);
                process.exit(1);  // Exit with a non-zero status to prevent commit
            }
        });
    }).on('error', err => {
        console.log('Error:', err.message);
        process.exit(1);  // Exit with a non-zero status to prevent commit
    });
}





























#!/bin/bash

# Get the current user's email
current_user_email=$(git config user.email)  # Fetch the current user email from git config

# Get the timestamp of the last commit made by the current user
last_commit_date=$(git log --author="$current_user_email" -1 --format=%ct)  # Get the timestamp of the last commit made by the user

# Check if we found a commit by the current user
if [ -z "$last_commit_date" ]; then
    echo "✅ This is your first commit. Proceeding with commit."
    exit 0  # Allow the commit if no previous commit is found (first commit)
fi

# Get the current time (in seconds since epoch)
current_date=$(date +%s)

# Calculate the difference between the current time and the last commit time in seconds
difference_in_seconds=$((current_date - last_commit_date))

# Get the human-readable commit time for the last commit and the current time
last_commit_time=$(date -d @$last_commit_date)
current_commit_time=$(date)

# Calculate the difference in seconds, and convert to hours, minutes, and seconds for readability
difference_in_minutes=$((difference_in_seconds / 60))
difference_in_hours=$((difference_in_seconds / 3600))
remaining_seconds=$((difference_in_seconds % 60))
difference_in_days=$((difference_in_seconds / 86400))  # 86400 seconds in a day

# Display the commit times and the time difference
echo "Last Commit by '$current_user_email' Time: $last_commit_time"
echo "Current Commit Time: $current_commit_time"
echo "Time Difference: $difference_in_seconds seconds, or $difference_in_days days, $((difference_in_hours % 24)) hours, and $remaining_seconds seconds."

# Check if the commit is more than 3 days late
if [ $difference_in_seconds -gt 259200 ]; then  # 259200 seconds = 3 days
    # Call the API to check if the user's email is approved
    api_url="https://gitops-production.up.railway.app/api/emails"
    
    # Get the list of approved emails from the API and store in the variable
    approved_emails=$(curl -s "$api_url" | jq -r '.approved[]')

    # Check if the current user's email is in the approved list
    if echo "$approved_emails" | grep -q "^$current_user_email$"; then
        echo "✅ Your email is approved. You can proceed with commit."
        exit 0  # Allow the commit if email is approved
    else
        echo "$current_user_email ❌ Your email is not approved for committing due to delayed activity. Please contact admin to unblock."
        exit 1  # Exit with a non-zero status to prevent commit
    fi
else
    # If the last commit was within the last 3 days, allow the commit
    echo "✅ Your last commit was within the last 3 days. Proceeding with commit."
    exit 0  # Exit with zero status to allow the commit
fi

