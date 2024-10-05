const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database('./database.sqlite', { verbose: console.log });

const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');

db.exec(initSQL);

console.log('Database initialized successfully');

db.close();