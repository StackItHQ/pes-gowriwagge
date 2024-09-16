const { google } = require('googleapis');
const mysql = require('mysql2');
const credentials = require('./credentials.json'); // Path to your credentials.json file

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vision@2020',
  database: 'SheettoDb',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Google Sheets API authorization
async function authorize() {
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web; // Adjust according to your credentials structure
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Replace 'YOUR_REFRESH_TOKEN' with the actual refresh token you received from the OAuth flow
  oAuth2Client.setCredentials({
    refresh_token: '1//0g8kfQIHEnT2OCgYIARAAGBASNwF-L9Irr2mcZMXkPdJZYPy-eDcgLOYte57Yh5NHiRY3WMpdAw5Vwbt1VNjPviHud1gQe8P_TDY', // Replace with your refresh token
  });

  return oAuth2Client;
}

// Fetch data from Google Sheets
async function getSheetData(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '1m6KWFf30sghe25ILBIf_KwcHTxI8sOf0aVo_jwR6fEQ', // Replace with your spreadsheet ID
    range: 'Sheet1!A1:F', // Adjust the range to your needs
  });
  return response.data.values;
}

// Insert data into the database
async function insertDataIntoDatabase(data) {
  for (const row of data) {
    const query = `
      INSERT INTO employees (column1, column2, column3, column4, column5, column6) 
      VALUES (?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE column2=?, column3=?, column4=?, column5=?, column6=?`;
    
    connection.query(query, [row[0], row[1], row[2], row[3], row[4], row[5], row[1], row[2], row[3], row[4], row[5]], (error, results, fields) => {
      if (error) throw error;
      console.log('Data inserted or updated:', row);
    });
  }
}


// Main function to run the sync process
async function syncSheetToDatabase() {
  const auth = await authorize();
  const sheetData = await getSheetData(auth);
  await insertDataIntoDatabase(sheetData);
  connection.end();
}

syncSheetToDatabase().catch(console.error);
