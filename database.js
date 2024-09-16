const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',   // Replace with your MySQL user
  password: 'Vision@2020', // Replace with your MySQL password
  database: 'SheettoDb', // Replace with your database name
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;
