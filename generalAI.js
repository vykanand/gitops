const { GoogleGenerativeAI } = require('@google/generative-ai');

// Array of API keys to rotate
const apiKeys = [
    'AIzaSyDgeZ-JVfUuVouEoDv_FxlPfCuxz6LeVyw',
    'AIzaSyDuMVRujmPygn0g1QxI-a8CUEZ9gu-Q778',
    'AIzaSyCprWxBmsoxPDcA0OTsYGOOtYVd_51J5po',
    'AIzaSyD-yA6Mg6tLYaRLFwmfis2g41-ONx-lSzc'
];

let currentKeyIndex = 0;

const getNextApiKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return apiKeys[currentKeyIndex];
};

const genAI = new GoogleGenerativeAI(getNextApiKey()); // Initialize with the first API key

async function askQuestion(question) {
    while (apiKeys.length > 0) {
        const apiKey = getNextApiKey(); // Get the next API key
        console.log(`Using API key: ${apiKey}`);

        try {
            // Re-initialize the client with the current API key
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const chat = model.startChat();
            const result = await chat.sendMessage(question);

            // Check if response is text and handle accordingly
            if (typeof result.response.text === 'function') {
                const responseText = await result.response.text();
                console.log('Received response.');
                return responseText.trim();
            } else {
                throw new Error('Unexpected response format.');
            }
        } catch (error) {
            console.error(`Error with API key ${apiKey}:`, error.message);

            // If we exhausted all keys, throw error
            if (apiKeys.length === 0) {
                throw new Error('All API keys have been tried and failed.');
            }
        }
    }
}

module.exports = { askQuestion };
