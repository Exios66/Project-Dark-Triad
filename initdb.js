const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'database.sql');

// Create a new database or open existing one
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        return;
    }
    console.log('Connected to the SQLite database.');

    // Read the SQL schema
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the SQL commands
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing SQL schema:', err);
        } else {
            console.log('Database schema initialized successfully');
        }
        
        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
});