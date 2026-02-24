
# Silver Lab Verification System (HTML/Node.js/MySQL)

A high-performance, minimal verification system optimized for Hostinger deployment.

## Setup
1. Create a MySQL database in your Hostinger panel.
2. The server will **automatically create the required tables** on the first run.
3. Run:
   ```bash
   npm install
   npm start
   ```

## Configuration
Database credentials and the authentication secret have been hardcoded into `server.js` for simplicity.
-   **Default Admin**: `username: admin`, `password: admin` (Change this after first login).
