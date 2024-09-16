# Realtimesync

**Realtimesync** is a Node.js application that provides real-time synchronization between a Google Sheet and a MySQL database. It detects changes in both the Google Sheet and the MySQL database, ensuring that any modification in one is reflected in the other through CRUD operations. The application uses Google Sheets API for integration and OAuth2 for authentication.

## Features
- **Real-time synchronization**: Automatically syncs data between Google Sheets and a MySQL database.
- **CRUD support**: Handles creation, reading, updating, and deletion of records in both Google Sheets and the database.
- **Scalable**: Built with scalability in mind, ensuring smooth performance even with large datasets.

## Project Structure
The project contains several files that handle different tasks related to syncing and authentication the main ones are:
1. **sheettodb.js**: Handles fetching data from Google Sheets and updating the MySQL database.
2. **dbtosheet.js**: Handles fetching data from the MySQL database and updating Google Sheets.
3. **auth.js**: Contains the OAuth2 setup for authenticating with the Google Sheets API.

## Installation

### Prerequisites
1. Node.js installed on your system.
2. MySQL installed and a database set up with the required schema.
3. Google Cloud Platform project set up with OAuth credentials for Google Sheets API access.
4. Required Node packages:
   - `mysql2`
   - `googleapis`
   - `node-cron`
   - `moment`

# MySQL Tables Overview

This project uses key MySQL table: `sync_data` for employee details (ID, Name, Department, Joining_Date, Salary, Performance_Score). This table enable real-time synchronization between Google Sheets and the database.

## Conclusion

**Realtimesync** simplifies real-time data synchronization between Google Sheets and MySQL databases, making it an invaluable tool for automating workflows and ensuring data consistency. Its ability to handle full CRUD operations, secure integration, and scalability makes it highly applicable to real-world scenarios like managing business data, streamlining processes, and reducing manual effort. This project offers a practical, efficient solution for maintaining up-to-date records in both environments, benefiting organizations across various industries.

Feel free to contribute, raise issues, or suggest improvements to enhance the project's capabilities.
gowriwagge@gmail.com




