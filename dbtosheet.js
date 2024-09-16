const { google } = require('googleapis');
const authorize = require('./auth'); // Import authorization function
const mysql = require('mysql2');

// Replace with your spreadsheet ID and range
const SPREADSHEET_ID = '1m6KWFf30sghe25ILBIf_KwcHTxI8sOf0aVo_jwR6fEQ';
const RANGE = 'Sheet1!A1';

// MySQL connection configuration
const dbConfig = {
  host: 'localhost', // Database host
  user: 'root', // Database user
  password: 'Vision@2020', // Database password
  database: 'SheettoDb' // Database name
};

// Function to fetch records from MySQL
async function fetchRecordsFromMySQL() {
  const connection = mysql.createConnection(dbConfig);
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM employees', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
      connection.end();
    });
  });
}

// Function to update Google Sheet
async function updateSheet(values) {
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [ // Assuming `values` is an array of arrays for your data
          ['ID', 'Name', 'Department', 'Joining_Date', 'Salary', 'Performance_Score'],
          ...values
        ],
      },
    });
    console.log('Sheet updated successfully');
  } catch (error) {
    console.error('Error updating sheet:', error);
  }
}

// Convert MySQL records to Google Sheets format
function formatRecordsForSheet(records) {
  return records.map(record => [
    record.ID, 
    record.Name, 
    record.Department, 
    record['Joining_Date'], // Adjust field name based on your table schema
    record.Salary, 
    record['Performance_Score'] // Adjust field name based on your table schema
  ]);
}

// Main function
async function main() {
  try {
    const mysqlRecords = await fetchRecordsFromMySQL();
    const formattedRecords = formatRecordsForSheet(mysqlRecords);
    await updateSheet(formattedRecords);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
