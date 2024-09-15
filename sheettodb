require('dotenv').config();  // Load environment variables from .env file
const cron = require('node-cron');
const { google } = require('googleapis');
const mysql = require('mysql2');
const OAuth2 = google.auth.OAuth2;
const moment = require('moment'); // Import moment for date formatting

// Initialize OAuth2 client with credentials from .env
const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Set the OAuth2 credentials from .env
oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
    token_type: 'Bearer',
    expiry_date: 1726402639680
});

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

// MySQL connection setup using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Function to check for changes between Google Sheets and MySQL
function checkForChanges() {
  console.log('Checking for changes...');

  // Fetch data from Google Sheets
  sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A1:F',
  }, (err, res) => {
    if (err) return console.log('Error accessing sheets:', err);
    const sheetRows = res.data.values || [];
    console.log('Google Sheets Data:', sheetRows);

    // Fetch data from MySQL
    connection.query('SELECT * FROM sync_data', (err, dbResults) => {
      if (err) throw err;
      console.log('Database Data:', dbResults);

      // Compare and sync data
      syncData(sheetRows, dbResults);
    });
  });
}

// Function to sync Google Sheets data with MySQL database
function syncData(sheetRows, dbResults) {
    console.log('Syncing data...');

    // Convert sheetRows to a format suitable for comparison
    const sheetData = sheetRows.slice(1).map(row => ({
        ID: row[0],
        Name: row[1],
        Department: row[2],
        Joining_Date: moment(row[3]).format('YYYY-MM-DD'), // Convert date to YYYY-MM-DD format
        Salary: row[4],
        Performance_Score: row[5],
    }));

    // Convert dbResults to a map for easy comparison
    const dbData = {};
    dbResults.forEach(row => {
        dbData[row.ID] = row;
    });

    // Sync Google Sheets to Database
    sheetData.forEach(sheetRow => {
        const dbRow = dbData[sheetRow.ID];
        if (dbRow) {
            // Update the existing record if there are changes
            if (JSON.stringify(sheetRow) !== JSON.stringify(dbRow)) {
                connection.query(
                    'UPDATE sync_data SET Name = ?, Department = ?, Joining_Date = ?, Salary = ?, Performance_Score = ? WHERE ID = ?',
                    [sheetRow.Name, sheetRow.Department, sheetRow.Joining_Date, sheetRow.Salary, sheetRow.Performance_Score, sheetRow.ID],
                    (err) => {
                        if (err) throw err;
                        console.log(Updated ID ${sheetRow.ID});
                    }
                );
            }
        } else {
            // Insert new record if it doesn't exist in the database
            connection.query(
                'INSERT INTO sync_data (ID, Name, Department, Joining_Date, Salary, Performance_Score) VALUES (?, ?, ?, ?, ?, ?)',
                [sheetRow.ID, sheetRow.Name, sheetRow.Department, sheetRow.Joining_Date, sheetRow.Salary, sheetRow.Performance_Score],
                (err) => {
                    if (err) throw err;
                    console.log(Inserted ID ${sheetRow.ID});
                }
            );
        }
    });

    // Sync Database to Google Sheets
    const sheetIDs = new Set(sheetData.map(row => row.ID));
    const deletedRows = dbResults.filter(dbRow => !sheetIDs.has(dbRow.ID));

    // Delete rows from the database that are no longer in the sheet
    deletedRows.forEach(row => {
        connection.query(
            'DELETE FROM sync_data WHERE ID = ?',
            [row.ID],
            (err) => {
                if (err) throw err;
                console.log(Deleted ID ${row.ID} from database);
            }
        );
    });

    // Prepare updated rows for Google Sheets
    const updatedRows = dbResults.filter(dbRow => {
        const sheetRow = sheetData.find(row => row.ID === dbRow.ID);
        return !sheetRow || new Date(dbRow.last_modified) > new Date(sheetRow.Joining_Date);
    });

    if (updatedRows.length > 0) {
        const updatedSheetData = updatedRows.map(row => [
            row.ID,
            row.Name,
            row.Department,
            row.Joining_Date,
            row.Salary,
            row.Performance_Score,
        ]);

        sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A2',
            valueInputOption: 'RAW',
            resource: {
                values: updatedSheetData,
            },
        }, (err, res) => {
            if (err) return console.log('Error updating sheets:', err);
            console.log('Updated Google Sheets with database changes.');
        });
    }
}

// Schedule this task to run every minute
// cron.schedule('* * * * *', () => {
//   checkForChanges();
// });

setInterval(() => {
  checkForChanges();
}, 1000);