# Project Dark Triad

## Comprehensive Personality Assessments Web Application

Project Dark Triad is a web application designed to provide comprehensive personality assessments, focusing on the Dark Triad traits (Machiavellianism, Narcissism, and Psychopathy) and other related personality constructs.

### Features

- User registration and authentication
- Multiple personality assessments including:
  - Short Dark Triad (SD3)
  - Dirty Dozen
  - Short Dark Tetrad (SD4)
  - MACH-IV
  - Big Five Inventory (BFI)
  - HEXACO-60
  - MMPI-2-RF
- Secure storage of user data and assessment results
- Admin panel for managing assessments and viewing statistics

### Tech Stack

- Backend: Node.js with Express.js
- Database: SQLite
- Frontend: HTML, CSS, JavaScript
- Authentication: JSON Web Tokens (JWT)
- Testing: Jest

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/project-dark-triad.git
   cd project-dark-triad
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   ```

4. Initialize the database:
   ```
   sqlite3 database.sqlite < database.sql
   ```

### Running the Application

1. Start the server:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

### Testing

Run the test suite:
```
npm test