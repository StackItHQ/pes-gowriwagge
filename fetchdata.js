const mysql = require('mysql');
const moment = require('moment');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vision@2020',
    database: 'SheettoDb'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

function insertDataIntoDatabase(sheetRows) {
    // Skip header row and process data
    const rows = sheetRows.slice(1).map(row => ({
        ID: row[0],
        Name: row[1],
        Department: row[2],
        Joining_Date: moment(row[3], 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('YYYY-MM-DD'), // Convert to MySQL date format
        Salary: row[4],
        Performance_Score: row[5],
    }));

    rows.forEach(row => {
        const query = `
            INSERT INTO employees (ID, Name, Department, Joining_Date, Salary, Performance_Score)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE Name = VALUES(Name), Department = VALUES(Department), Joining_Date = VALUES(Joining_Date), Salary = VALUES(Salary), Performance_Score = VALUES(Performance_Score)
        `;
        console.log('Executing query:', query, [row.ID, row.Name, row.Department, row.Joining_Date, row.Salary, row.Performance_Score]);

        connection.query(query, [row.ID, row.Name, row.Department, row.Joining_Date, row.Salary, row.Performance_Score], (err) => {
            if (err) {
                console.error('Error executing query:', err);
                throw err;
            }
            console.log(`Processed ID ${row.ID}`);
        });
    });
}

module.exports = { insertDataIntoDatabase };
