# Realtimesync

**Realtimesync** is a Node.js application that provides real-time synchronization between a Google Sheet and a MySQL database. It detects changes in both the Google Sheet and the MySQL database, ensuring that any modification in one is reflected in the other through CRUD operations. The application uses Google Sheets API for integration and OAuth2 for authentication.

## Features
- **Real-time synchronization**: Automatically syncs data between Google Sheets and a MySQL database.
- **CRUD support**: Handles creation, reading, updating, and deletion of records in both Google Sheets and the database.
- **Conflict resolution (Optional)**: Designed to handle conflicts when changes are made simultaneously on both platforms.
- **Scalable**: Built with scalability in mind, ensuring smooth performance even with large datasets.

## Project Structure
The project contains several files that handle different tasks related to syncing and authentication:
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



