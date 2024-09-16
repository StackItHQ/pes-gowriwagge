const connection = require('./database');

async function syncData() {
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1m6KWFf30sghe25ILBIf_KwcHTxI8sOf0aVo_jwR6fEQ';
  const range = 'Sheet1!A1:D10';

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (rows.length) {
    rows.forEach((row) => {
      const [col1, col2, col3, col4] = row;
      // Example query, adjust according to your table schema
      connection.query(
        'INSERT INTO your_table (col1, col2, col3, col4) VALUES (?, ?, ?, ?)',
        [col1, col2, col3, col4],
        (err, results) => {
          if (err) throw err;
          console.log('Data inserted:', results.insertId);
        }
      );
    });
  }
}

syncData().catch(console.error);
