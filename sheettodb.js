const cron = require('node-cron');
const { google } = require('googleapis');
const mysql = require('mysql2');
const OAuth2 = google.auth.OAuth2;
const moment = require('moment'); // Import moment

// Initialize OAuth2 client with your credentials
// confidental

// Set the OAuth2 credentials
oauth2Client.setCredentials({
    access_token: 'ya29.a0AcM612zYzynkXXn_gJ_ypQajew1Kdp0mdAWkrC0zsmn23kr_5hSLjXctNywFGAds0IOqbauL0_U7ifUWgvaGcdL0QAd2_3wTpPHqruYPmgEuJr5XgjSM8Ru9HmD8fvQA0_r6rL2Ev_1hZWpLOhNqPyA_E0SoQCriBLm1N-1yaCgYKAbcSARMSFQHGX2MiKgJGhYZkrIVd_sDtgt8YnA0175',
    refresh_token: '1//0g8kfQIHEnT2OCgYIARAAGBASNwF-L9Irr2mcZMXkPdJZYPy-eDcgLOYte57Yh5NHiRY3WMpdAw5Vwbt1VNjPviHud1gQe8P_TDY',
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive',
    token_type: 'Bearer',
    expiry_date: 1726402639680
});

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

// MySQL connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vision@2020',
  database: 'SheettoDb'
});

// Function to check for changes
function checkForChanges() {
  console.log('Checking for changes...');

  // Fetch data from Google Sheets
  sheets.spreadsheets.values.get({
    spreadsheetId: '1m6KWFf30sghe25ILBIf_KwcHTxI8sOf0aVo_jwR6fEQ',
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

// Function to sync data
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
                        console.log(`Updated ID ${sheetRow.ID}`);
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
                    console.log(`Inserted ID ${sheetRow.ID}`);
                }
            );
        }
    });

    // Sync Database to Google Sheets
    const sheetIDs = new Set(sheetData.map(row => row.ID));
    const deletedRows = dbResults.filter(dbRow => !sheetIDs.has(dbRow.ID));

    // Delete rows from the database that are no longer in the sheet
    deletedRows.forEach(row => {
      console.log(row.ID)
        connection.query(
            'DELETE FROM sync_data WHERE ID = ?',
            [row.ID],
            (err) => {
                if (err) throw err;
                console.log(`Deleted ID ${row.ID} from database`);
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
            spreadsheetId: '1m6KWFf30sghe25ILBIf_KwcHTxI8sOf0aVo_jwR6fEQ',
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
}, 5000);
