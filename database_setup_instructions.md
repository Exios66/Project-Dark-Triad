# Database Setup Instructions

## Prerequisites

- Node.js and npm installed on your machine
- Basic knowledge of terminal/command line usage

## Steps

1. Install required Node.js packages:

   ```
   npm install
   ```

2. Create a `.env` file in the root directory of your project if it doesn't exist already:

   ```
   touch .env
   ```

3. Add the following content to the `.env` file:

   ```
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   ```

   Replace `your_jwt_secret_here` with a secure random string for JWT token generation.

4. The SQLite database will be automatically created when you start the server for the first time. The database file will be named `database.sqlite` and will be located in the root directory of your project.

5. To initialize the database schema, we need to run the SQL commands from the `sql/schema.sql` file. We'll modify our server to do this automatically on startup.

6. Open the `server.js` file and add the following function after the database connection setup:

   ```javascript
   function initializeDatabase() {
     const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
     const statements = schemaSQL.split(';').filter(stmt => stmt.trim() !== '');
     
     db.serialize(() => {
       statements.forEach(statement => {
         db.run(statement, err => {
           if (err) {
             console.error('Error executing SQL statement:', err);
             console.error('Statement:', statement);
           }
         });
       });
       console.log('Database schema initialized');
     });
   }
   ```

   Then call this function right after the database connection is established:

   ```javascript
   db.serialize(() => {
     initializeDatabase();
     // ... rest of your code
   });
   ```

7. Start your Node.js application:

   ```
   node server.js
   ```

8. If there are no errors on startup, your SQLite database has been successfully created and initialized with the necessary tables.

## Verifying the Setup

To verify that the database has been set up correctly, you can use the SQLite command-line tool:

1. Install the SQLite command-line tool if you haven't already.

2. Open a terminal and navigate to your project directory.

3. Run the following command to open the SQLite database:

   ```
   sqlite3 database.sqlite
   ```

4. Once in the SQLite prompt, you can run SQL commands to check the tables:

   ```sql
   .tables
   ```

   This should list all the tables created by the schema.

5. You can also check the structure of a specific table:

   ```sql
   .schema Users
   ```

6. Exit the SQLite prompt by typing:

   ```
   .quit
   ```

## Troubleshooting

- If you encounter any errors during the database initialization, check the console output for specific error messages.
- Ensure that the `sql/schema.sql` file exists and contains valid SQL statements.
- Make sure you have write permissions in the project directory for creating the SQLite database file.

Note: Keep your `.env` file and `database.sqlite` file secure and never commit them to version control.
