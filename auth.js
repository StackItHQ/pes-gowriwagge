const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const TOKEN_PATH = 'token.json'; // Path where the token will be stored

// confidentail
);

// Load previously authorized token from a file
function loadToken() {
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    return JSON.parse(token);
  } catch (error) {
    return null;
  }
}

// Save token to disk
function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

// Get new token after prompting for user authorization
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive' // Optional: Add if needed
        ]
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code:', async (code) => {
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    saveToken(tokens);
    console.log('Token stored to', TOKEN_PATH);
  });
}

// Initialize OAuth2 client
async function authorize() {
  const token = loadToken();
  if (token) {
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  await getNewToken(oAuth2Client);
  return oAuth2Client;
}

module.exports = authorize;
